import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PublicArticleDetail from './PublicArticleDetail'
import { getPublicPost } from '../api/blogApi'

vi.mock('../api/blogApi', () => ({ getPublicPost: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content, dark }) => <div data-testid="viewer" data-dark={String(dark)}>{content}</div>,
}))

const post = {
  title: 'Belajar Gin',
  category: 'Teknologi',
  excerpt: 'Ringkasan artikel',
  content: '## Isi',
  cover_image_path: 'https://img/c.png',
  reading_time: 4,
  author: { name: 'Budi' },
  published_at: '2026-02-01T00:00:00Z',
}

describe('PublicArticleDetail', () => {
  it('merender artikel lengkap', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    getPublicPost.mockResolvedValue(post)
    render(<PublicArticleDetail slug="belajar-gin" onNavigate={onNavigate} isDark />)
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Belajar Gin' })).toBeInTheDocument()
    expect(screen.getByText('Ringkasan artikel')).toBeInTheDocument()
    expect(screen.getByText('4 menit baca')).toBeInTheDocument()
    expect(screen.getByText('Budi')).toBeInTheDocument()
    expect(screen.getByAltText('Belajar Gin')).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveAttribute('data-dark', 'true')
    await user.click(screen.getByText('Kembali ke beranda'))
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('artikel tanpa excerpt, sampul, dan penulis', async () => {
    getPublicPost.mockResolvedValue({ ...post, excerpt: '', cover_image_path: '', author: null })
    render(<PublicArticleDetail slug="x" onNavigate={vi.fn()} isDark={false} />)
    expect(await screen.findByText('Anonim')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('menampilkan halaman tidak ditemukan', async () => {
    getPublicPost.mockRejectedValue(new Error('artikel tidak ditemukan'))
    render(<PublicArticleDetail slug="hilang" onNavigate={vi.fn()} />)
    expect(await screen.findByText('Artikel tidak ditemukan')).toBeInTheDocument()
    expect(screen.getByText('artikel tidak ditemukan')).toBeInTheDocument()
  })

  it('mengabaikan respons setelah unmount', async () => {
    let resolve, reject
    getPublicPost.mockReturnValueOnce(new Promise((r) => (resolve = r)))
    const a = render(<PublicArticleDetail slug="a" onNavigate={vi.fn()} />)
    a.unmount()
    resolve(post)
    getPublicPost.mockReturnValueOnce(new Promise((_, r) => (reject = r)))
    const b = render(<PublicArticleDetail slug="b" onNavigate={vi.fn()} />)
    b.unmount()
    reject(new Error('x'))
    await waitFor(() => expect(getPublicPost).toHaveBeenCalledTimes(2))
  })
})
