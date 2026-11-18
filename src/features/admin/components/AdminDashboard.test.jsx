import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import AdminDashboard from './AdminDashboard'
import { getAllPosts, getUserPosts, getUsers } from '../api/adminApi'

vi.mock('../api/adminApi', () => ({ getUsers: vi.fn(), getAllPosts: vi.fn(), getUserPosts: vi.fn() }))

const users = [
  { id: 1, name: 'Administrator', username: 'admin', email: 'admin@delcom.org', role: 'admin', total_posts: 0, published_posts: 0 },
  { id: 2, name: 'Budi', username: 'budi', email: 'budi@x.com', role: 'member', total_posts: 2, published_posts: 1 },
]
const posts = [
  { id: 1, title: 'Artikel Publik', slug: 'artikel-publik', category: 'Teknologi', is_published: true, author: { name: 'Budi' }, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, title: 'Draf Rahasia', slug: 'draf-rahasia', category: 'Bisnis', is_published: false, created_at: '2026-01-02T00:00:00Z' },
]

describe('AdminDashboard', () => {
  beforeEach(() => {
    getUsers.mockResolvedValue(users)
    getAllPosts.mockResolvedValue(posts)
  })

  it('menampilkan ringkasan dan tabel pengguna dengan pencarian', async () => {
    const u = userEvent.setup()
    render(<AdminDashboard onNavigate={vi.fn()} />)
    expect(screen.getByText('Memuat data...')).toBeInTheDocument()
    expect(await screen.findByText('admin@delcom.org')).toBeInTheDocument()
    expect(screen.getByText('Total Pengguna').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Artikel Terbit').nextSibling).toHaveTextContent('1')

    await u.type(screen.getByPlaceholderText('Cari...'), 'budi')
    expect(screen.queryByText('admin@delcom.org')).not.toBeInTheDocument()
    expect(screen.getByText('budi@x.com')).toBeInTheDocument()
  })

  it('tab semua artikel: filter dan navigasi artikel terbit', async () => {
    const u = userEvent.setup()
    const onNavigate = vi.fn()
    render(<AdminDashboard onNavigate={onNavigate} />)
    await screen.findByText('admin@delcom.org')
    await u.click(screen.getByRole('tab', { name: 'Semua Artikel' }))
    expect(screen.getByText('Draf Rahasia')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Artikel Publik' }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/artikel-publik')

    await u.type(screen.getByPlaceholderText('Cari...'), 'tidak-ada')
    expect(screen.getByText('Belum ada artikel.')).toBeInTheDocument()
    await u.clear(screen.getByPlaceholderText('Cari...'))
    await u.type(screen.getByPlaceholderText('Cari...'), 'budi')
    expect(screen.getByText('Artikel Publik')).toBeInTheDocument()
    await u.click(screen.getByRole('tab', { name: 'Pengguna' }))
    expect(screen.getByText('budi@x.com')).toBeInTheDocument()
  })

  it('melihat artikel milik pengguna tertentu dan kembali', async () => {
    const u = userEvent.setup()
    getUserPosts.mockResolvedValue([posts[0]])
    render(<AdminDashboard onNavigate={vi.fn()} />)
    await screen.findByText('budi@x.com')
    await u.click(screen.getAllByText('Lihat Artikel')[1])
    expect(await screen.findByText(/Artikel milik Budi/)).toBeInTheDocument()
    expect(getUserPosts).toHaveBeenCalledWith(2)
    expect(screen.queryByText('Penulis')).not.toBeInTheDocument()
    await u.click(screen.getByLabelText('Kembali ke daftar pengguna'))
    expect(screen.getByRole('tab', { name: 'Pengguna' })).toBeInTheDocument()
  })

  it('error memuat data dan error artikel pengguna', async () => {
    const u = userEvent.setup()
    getUserPosts.mockRejectedValue(new Error('pengguna tidak ditemukan'))
    render(<AdminDashboard onNavigate={vi.fn()} />)
    await screen.findByText('budi@x.com')
    await u.click(screen.getAllByText('Lihat Artikel')[0])
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'pengguna tidak ditemukan' })))
  })

  it('menampilkan error saat data admin gagal dimuat', async () => {
    getUsers.mockRejectedValue(new Error('Anda tidak memiliki akses'))
    render(<AdminDashboard onNavigate={vi.fn()} />)
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Gagal Memuat Data Admin' })))
    expect(screen.queryByText('Memuat data...')).not.toBeInTheDocument()
  })
})
