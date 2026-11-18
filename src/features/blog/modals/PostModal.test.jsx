import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import PostModal from './PostModal'

vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange, dark }) => (
    <textarea aria-label="Editor Markdown" data-dark={String(dark)} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

describe('PostModal', () => {
  it('mode tambah: validasi lalu simpan', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn(() => Promise.resolve())
    render(<PostModal onClose={vi.fn()} onSave={onSave} isDark />)
    expect(screen.getByText('Tambah Artikel')).toBeInTheDocument()
    expect(screen.getByLabelText('Editor Markdown')).toHaveAttribute('data-dark', 'true')

    await user.click(screen.getByText('Simpan'))
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Data Belum Lengkap' }))
    expect(onSave).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Judul'), 'Artikel Baru')
    await user.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await user.type(screen.getByLabelText('Ringkasan (excerpt)'), 'Ringkas')
    await user.type(screen.getByLabelText('URL Gambar Sampul'), 'https://img')
    expect(screen.getByText('Disimpan sebagai draf')).toBeInTheDocument()
    await user.click(screen.getByLabelText(/Terbitkan sekarang/))
    expect(screen.getByText('Tampil di halaman publik')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Editor Markdown'), { target: { value: 'satu dua tiga' } })
    expect(screen.getByTestId('word-count')).toHaveTextContent('3 kata')

    await user.click(screen.getByText('Simpan'))
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        title: 'Artikel Baru',
        category: 'Bisnis',
        excerpt: 'Ringkas',
        cover_image_path: 'https://img',
        content: 'satu dua tiga',
        is_published: true,
      }),
    )
  })

  it('mode edit: memuat data awal, gagal simpan, dan batal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn(() => Promise.reject(new Error('Server error')))
    const initial = { id: 3, title: 'Lama', category: 'Opini', excerpt: 'E', cover_image_path: 'c', content: 'isi lama', is_published: true }
    render(<PostModal initial={initial} onClose={onClose} onSave={onSave} />)
    expect(screen.getByText('Edit Artikel')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')
    expect(screen.getByLabelText('Kategori')).toHaveValue('Opini')

    await user.click(screen.getByText('Simpan'))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Gagal Menyimpan', text: 'Server error' })))
    expect(screen.getByText('Simpan').closest('button')).not.toBeDisabled()

    await user.click(screen.getByText('Batal'))
    await user.click(screen.getByLabelText('Tutup'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('draf dari AI tanpa id dianggap artikel baru', () => {
    render(<PostModal initial={{ title: 'Dari AI', content: 'x' }} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByText('Tambah Artikel')).toBeInTheDocument()
    expect(screen.getByLabelText('Kategori')).toHaveValue('Umum')
  })
})
