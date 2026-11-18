import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PublicArticleList from './PublicArticleList'
import { getCategories, getPublicPosts } from '../api/blogApi'

vi.mock('../api/blogApi', () => ({ getCategories: vi.fn(), getPublicPosts: vi.fn() }))

const posts = [
  { id: 1, slug: 'halo-golang', title: 'Halo Golang', category: 'Teknologi', excerpt: 'Ringkas', cover_image_path: 'https://img/1.png', reading_time: 3, author: { name: 'Budi' }, published_at: '2026-01-01T00:00:00Z' },
  { id: 2, slug: 'tanpa-sampul', title: 'Tanpa Sampul', category: 'Umum', excerpt: '', cover_image_path: '', reading_time: 1, published_at: null },
]

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('PublicArticleList', () => {
  it('menampilkan kartu artikel, filter kategori, dan pencarian live', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    getCategories.mockResolvedValue(['Teknologi', 'Umum'])
    getPublicPosts.mockResolvedValue(posts)
    render(<PublicArticleList user={null} onNavigate={onNavigate} onLoginClick={vi.fn()} />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(await screen.findByText('Halo Golang')).toBeInTheDocument()
    expect(screen.getByText('Tidak ada ringkasan.')).toBeInTheDocument()
    expect(screen.getByText('Anonim')).toBeInTheDocument()
    expect(screen.getByAltText('Halo Golang')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Teknologi' }))
    await waitFor(() => expect(getPublicPosts).toHaveBeenLastCalledWith({ q: '', category: 'Teknologi' }))
    expect(screen.getByRole('tab', { name: 'Teknologi' })).toHaveAttribute('aria-selected', 'true')

    await user.type(screen.getByPlaceholderText('Cari artikel...'), 'go')
    await waitFor(() => expect(getPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Teknologi' }))

    await user.click(await screen.findByRole('button', { name: 'Halo Golang' }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/halo-golang')
    await user.click(screen.getByLabelText('Baca Tanpa Sampul'))
    expect(onNavigate).toHaveBeenCalledWith('/posts/tanpa-sampul')
  })

  it('tombol Mulai Menulis: tamu membuka login, penulis ke workspace', async () => {
    const user = userEvent.setup()
    getCategories.mockRejectedValue(new Error('x'))
    getPublicPosts.mockResolvedValue([])
    const onLoginClick = vi.fn()
    const onNavigate = vi.fn()
    const { rerender } = render(<PublicArticleList user={null} onNavigate={onNavigate} onLoginClick={onLoginClick} />)
    expect(await screen.findByText('Belum ada artikel')).toBeInTheDocument()
    await user.click(screen.getByText('Mulai Menulis'))
    expect(onLoginClick).toHaveBeenCalled()

    rerender(<PublicArticleList user={{ id: 1 }} onNavigate={onNavigate} onLoginClick={onLoginClick} />)
    await user.click(screen.getByText('Mulai Menulis'))
    expect(onNavigate).toHaveBeenCalledWith('/author')
  })

  it('menampilkan pesan error dari API', async () => {
    getCategories.mockResolvedValue([])
    getPublicPosts.mockRejectedValue(new Error('Server sedang sibuk'))
    render(<PublicArticleList user={null} onNavigate={vi.fn()} onLoginClick={vi.fn()} />)
    expect(await screen.findByText('Server sedang sibuk')).toBeInTheDocument()
  })

  it('mengabaikan respons yang datang setelah komponen di-unmount', async () => {
    getCategories.mockResolvedValue([])
    const ok = deferred()
    getPublicPosts.mockReturnValueOnce(ok.promise)
    const first = render(<PublicArticleList user={null} onNavigate={vi.fn()} onLoginClick={vi.fn()} />)
    await waitFor(() => expect(getPublicPosts).toHaveBeenCalledTimes(1))
    first.unmount()
    ok.resolve(posts)

    const bad = deferred()
    getPublicPosts.mockReturnValueOnce(bad.promise)
    const second = render(<PublicArticleList user={null} onNavigate={vi.fn()} onLoginClick={vi.fn()} />)
    await waitFor(() => expect(getPublicPosts).toHaveBeenCalledTimes(2))
    second.unmount()
    bad.reject(new Error('telat'))
    await Promise.resolve()
  })
})
