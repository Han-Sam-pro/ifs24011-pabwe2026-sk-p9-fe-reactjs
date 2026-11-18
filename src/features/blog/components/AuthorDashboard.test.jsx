import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import AuthorDashboard from './AuthorDashboard'
import * as api from '../api/blogApi'

vi.mock('../api/blogApi', () => ({
  getMyPosts: vi.fn(),
  getStats: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  togglePublish: vi.fn(),
  deletePost: vi.fn(),
  generateWithAi: vi.fn(),
}))
vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => <textarea aria-label="Editor Markdown" value={value} onChange={(e) => onChange(e.target.value)} />,
}))
vi.mock('../../../components/MarkdownViewer', () => ({ default: ({ content }) => <div>{content}</div> }))

const posts = [
  { id: 1, title: 'Artikel Terbit', slug: 'artikel-terbit', category: 'Teknologi', content: 'isi', is_published: true, reading_time: 2, updated_at: '2026-01-01T00:00:00Z' },
  { id: 2, title: 'Catatan Draf', slug: 'catatan-draf', category: 'Bisnis', content: 'isi draf', is_published: false, reading_time: 1, updated_at: '2026-01-02T00:00:00Z' },
]
const user = { id: 1, name: 'Budi', role: 'member' }

function renderDashboard(props = {}) {
  return render(<AuthorDashboard user={user} onNavigate={vi.fn()} isDark={false} {...props} />)
}

describe('AuthorDashboard', () => {
  beforeEach(() => {
    api.getMyPosts.mockResolvedValue(posts)
    api.getStats.mockResolvedValue({ total: 2, published: 1, draft: 1 })
  })

  it('memuat statistik dan tabel artikel, filter pencarian', async () => {
    const u = userEvent.setup()
    renderDashboard()
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByText('Artikel Terbit')).toBeInTheDocument()
    expect(screen.getByText('Halo, Budi 👋')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('2')

    const search = screen.getByPlaceholderText('Cari judul atau kategori...')
    await u.type(search, 'bisnis')
    expect(screen.queryByText('Artikel Terbit')).not.toBeInTheDocument()
    expect(screen.getByText('Catatan Draf')).toBeInTheDocument()
    await u.clear(search)
    await u.type(search, 'terbit')
    expect(screen.getByText('Artikel Terbit')).toBeInTheDocument()
    await u.type(search, 'zzz')
    expect(screen.getByText('Tidak ada artikel yang cocok.')).toBeInTheDocument()
  })

  it('state kosong dan error saat memuat', async () => {
    api.getMyPosts.mockResolvedValueOnce([])
    const { unmount } = renderDashboard()
    expect(await screen.findByText('Belum ada artikel. Mulai tulis artikel pertama Anda!')).toBeInTheDocument()
    unmount()

    api.getStats.mockRejectedValueOnce(new Error('gagal memuat'))
    renderDashboard()
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Gagal Memuat Artikel' })))
  })

  it('toggle publikasi (terbit <-> draf) dan error toggle', async () => {
    const u = userEvent.setup()
    renderDashboard()
    await screen.findByText('Artikel Terbit')
    api.togglePublish.mockResolvedValueOnce({ ...posts[1], is_published: true })
    await u.click(screen.getByLabelText('Status publikasi Catatan Draf'))
    await waitFor(() => expect(screen.getByTestId('stat-published')).toHaveTextContent('2'))
    expect(screen.getByTestId('stat-draft')).toHaveTextContent('0')

    api.togglePublish.mockResolvedValueOnce({ ...posts[0], is_published: false })
    await u.click(screen.getByLabelText('Status publikasi Artikel Terbit'))
    await waitFor(() => expect(screen.getByTestId('stat-published')).toHaveTextContent('1'))

    api.togglePublish.mockRejectedValueOnce(new Error('toggle gagal'))
    await u.click(screen.getByLabelText('Status publikasi Artikel Terbit'))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'toggle gagal' })))
  })

  it('menu kebab: lihat, buka/tutup, dan backdrop', async () => {
    const u = userEvent.setup()
    const onNavigate = vi.fn()
    renderDashboard({ onNavigate })
    await screen.findByText('Artikel Terbit')

    await u.click(screen.getByLabelText('Menu Catatan Draf'))
    expect(within(screen.getByRole('menu')).queryByText('Lihat')).not.toBeInTheDocument()
    await u.click(screen.getByLabelText('Menu Catatan Draf'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await u.click(screen.getByLabelText('Menu Artikel Terbit'))
    await u.click(screen.getByTestId('menu-backdrop'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await u.click(screen.getByLabelText('Menu Artikel Terbit'))
    await u.click(screen.getByRole('menuitem', { name: /Lihat/ }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/artikel-terbit')
  })

  it('tambah artikel baru dan edit artikel', async () => {
    const u = userEvent.setup()
    api.createPost.mockResolvedValue({ id: 3 })
    api.updatePost.mockResolvedValue({ id: 1 })
    renderDashboard()
    await screen.findByText('Artikel Terbit')

    await u.click(screen.getByText('Tambah Artikel'))
    await u.type(screen.getByLabelText('Judul'), 'Baru')
    fireEvent.change(screen.getByLabelText('Editor Markdown'), { target: { value: 'konten baru' } })
    await u.click(screen.getByText('Simpan'))
    await waitFor(() => expect(api.createPost).toHaveBeenCalledWith(expect.objectContaining({ title: 'Baru', content: 'konten baru' })))
    await waitFor(() => expect(screen.queryByText('Tambah Artikel', { selector: 'h2' })).not.toBeInTheDocument())

    await u.click(screen.getByLabelText('Menu Artikel Terbit'))
    await u.click(screen.getByRole('menuitem', { name: /Edit/ }))
    expect(screen.getByLabelText('Judul')).toHaveValue('Artikel Terbit')
    await u.click(screen.getByText('Simpan'))
    await waitFor(() => expect(api.updatePost).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Artikel Terbit' })))

    await u.click(screen.getByText('Tambah Artikel'))
    await u.click(screen.getByText('Batal'))
    expect(screen.queryByLabelText('Judul')).not.toBeInTheDocument()
  })

  it('hapus artikel: batal, berhasil, dan gagal', async () => {
    const u = userEvent.setup()
    renderDashboard()
    await screen.findByText('Artikel Terbit')

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    await u.click(screen.getByLabelText('Menu Catatan Draf'))
    await u.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    expect(api.deletePost).not.toHaveBeenCalled()

    api.deletePost.mockResolvedValueOnce(null)
    await u.click(screen.getByLabelText('Menu Catatan Draf'))
    await u.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    await waitFor(() => expect(api.deletePost).toHaveBeenCalledWith(2))

    api.deletePost.mockRejectedValueOnce(new Error('hapus gagal'))
    await u.click(screen.getByLabelText('Menu Catatan Draf'))
    await u.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'hapus gagal' })))
  })

  it('AI Generator: menerapkan draf ke editor, dan dapat ditutup', async () => {
    const u = userEvent.setup()
    api.generateWithAi.mockResolvedValue({ title: 'Judul AI', category: 'Opini', excerpt: 'Ex', content: 'Konten AI', sources: [] })
    renderDashboard()
    await screen.findByText('Artikel Terbit')

    await u.click(screen.getByText('AI Generator'))
    await u.click(screen.getByText('Batal'))
    expect(screen.queryByText('AI Blog Generator')).not.toBeInTheDocument()

    await u.click(screen.getByText('AI Generator'))
    await u.type(screen.getByLabelText('Topik Artikel'), 'Opini publik')
    await u.click(screen.getByText('Generate Artikel'))
    await u.click(await screen.findByText('Terapkan ke Editor'))
    expect(screen.getByLabelText('Judul')).toHaveValue('Judul AI')
    expect(screen.getByLabelText('Editor Markdown')).toHaveValue('Konten AI')
    expect(screen.getByText('Tambah Artikel', { selector: 'h2' })).toBeInTheDocument()
  })
})
