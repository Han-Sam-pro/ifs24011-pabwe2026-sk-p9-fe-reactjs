import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import App, { parseRoute, resolveAuthMode, resolveRedirect } from './App'
import { logout } from './features/auth/api/authApi'
import { AUTH_EXPIRED_EVENT, getToken, setSession } from './helpers/apiHelper'

vi.mock('./features/auth/api/authApi', () => ({ logout: vi.fn() }))
vi.mock('./features/blog/components/PublicArticleList', () => ({
  default: ({ onLoginClick, onNavigate }) => (
    <div>
      <p>Halaman Publik</p>
      <button onClick={onLoginClick}>buka-login</button>
      <button onClick={() => onNavigate('/posts/halo')}>buka-artikel</button>
    </div>
  ),
}))
vi.mock('./features/blog/components/PublicArticleDetail', () => ({ default: ({ slug }) => <p>Detail {slug}</p> }))
vi.mock('./features/blog/components/AuthorDashboard', () => ({ default: ({ user }) => <p>Workspace {user.name}</p> }))
vi.mock('./features/admin/components/AdminDashboard', () => ({ default: () => <p>Panel Admin</p> }))
vi.mock('./features/auth/components/AuthPage', () => ({
  default: ({ mode, onLogin, showHomeLink }) => (
    <div data-testid="auth-page" data-home={String(showHomeLink)}>
      <p>Auth {mode}</p>
      <button onClick={() => onLogin({ token: 'tok-m', user: { id: 2, name: 'Budi', role: 'member' } })}>login-member</button>
    </div>
  ),
}))
vi.mock('./features/auth/modals/AuthModal', () => ({
  default: ({ onClose, onLogin }) => (
    <div role="dialog">
      <button onClick={onClose}>tutup-modal</button>
      <button onClick={() => onLogin({ token: 'tok-a', user: { id: 1, name: 'Admin', role: 'admin' } })}>login-admin</button>
    </div>
  ),
}))

const member = { id: 2, name: 'Budi', role: 'member' }
const admin = { id: 1, name: 'Admin', role: 'admin' }

function goTo(path) {
  window.history.replaceState({}, '', path)
}

describe('parseRoute & resolveRedirect', () => {
  it('memetakan path ke rute', () => {
    expect(parseRoute('/')).toEqual({ name: 'public', path: '/' })
    expect(parseRoute('/public/')).toEqual({ name: 'public', path: '/' })
    expect(parseRoute('/posts/halo%20dunia')).toEqual({ name: 'detail', path: '/posts/halo%20dunia', slug: 'halo dunia' })
    expect(parseRoute('/author').name).toBe('author')
    expect(parseRoute('/admin').name).toBe('admin')
    expect(parseRoute('/login').name).toBe('login')
    expect(parseRoute('/register').name).toBe('register')
    expect(parseRoute('/tidak/ada').name).toBe('notfound')
  })

  it('menentukan redirect sesuai hak akses', () => {
    expect(resolveRedirect({ name: 'author' }, null)).toBe('/login')
    expect(resolveRedirect({ name: 'admin' }, null)).toBe('/login')
    expect(resolveRedirect({ name: 'admin' }, member)).toBe('/author')
    expect(resolveRedirect({ name: 'admin' }, admin)).toBeNull()
    expect(resolveRedirect({ name: 'login' }, member)).toBe('/author')
    expect(resolveRedirect({ name: 'register' }, admin)).toBe('/admin')
    expect(resolveRedirect({ name: 'login' }, null)).toBeNull()
    expect(resolveRedirect({ name: 'public' }, member)).toBeNull()
  })
})

describe('resolveAuthMode', () => {
  it('tamu di beranda/detail melihat login; pengguna login melihat halaman biasa', () => {
    expect(resolveAuthMode({ name: 'login' }, member)).toBe('login')
    expect(resolveAuthMode({ name: 'register' }, null)).toBe('register')
    expect(resolveAuthMode({ name: 'public' }, null)).toBe('login')
    expect(resolveAuthMode({ name: 'detail' }, null)).toBe('login')
    expect(resolveAuthMode({ name: 'public' }, member)).toBeNull()
    expect(resolveAuthMode({ name: 'notfound' }, null)).toBeNull()
  })
})

describe('App', () => {
  beforeEach(() => {
    goTo('/')
    logout.mockResolvedValue(null)
  })

  it('beranda (setelah login), navigasi SPA, popstate, dan 404', async () => {
    const user = userEvent.setup()
    setSession('tok', member)
    render(<App />)
    expect(screen.getByText('Halaman Publik')).toBeInTheDocument()
    await user.click(screen.getByText('buka-login'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByText('tutup-modal'))
    await user.click(screen.getByText('buka-artikel'))
    expect(screen.getByText('Detail halo')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/halo')

    act(() => {
      goTo('/halaman-aneh')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByText('Halaman tidak ditemukan')).toBeInTheDocument()
    await user.click(screen.getByText('Kembali ke Beranda'))
    expect(screen.getByText('Halaman Publik')).toBeInTheDocument()
  })

  it('tamu yang membuka / atau /posts/:slug langsung melihat halaman login (tanpa redirect)', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByText('Auth login')).toBeInTheDocument()
    expect(screen.getByTestId('auth-page')).toHaveAttribute('data-home', 'false')
    expect(window.location.pathname).toBe('/')
    expect(screen.queryByText('Halaman Publik')).not.toBeInTheDocument()
    await user.click(screen.getByText('login-member'))
    expect(window.location.pathname).toBe('/author')
    expect(screen.getByText('Workspace Budi')).toBeInTheDocument()
  })

  it('tamu di /posts/:slug juga melihat login', () => {
    goTo('/posts/halo')
    render(<App />)
    expect(screen.getByText('Auth login')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/halo')
  })

  it('rute terproteksi mengarahkan tamu ke /login lalu login member', async () => {
    const user = userEvent.setup()
    goTo('/author')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
    expect(screen.getByText('Auth login')).toBeInTheDocument()
    expect(screen.getByTestId('auth-page')).toHaveAttribute('data-home', 'true')
    await user.click(screen.getByText('login-member'))
    expect(window.location.pathname).toBe('/author')
    expect(screen.getByText('Workspace Budi')).toBeInTheDocument()
    expect(getToken()).toBe('tok-m')
  })

  it('halaman register untuk tamu', () => {
    goTo('/register')
    render(<App />)
    expect(screen.getByText('Auth register')).toBeInTheDocument()
  })

  it('modal login dari navbar: tutup, lalu login admin ke /admin', async () => {
    const user = userEvent.setup()
    goTo('/halaman-aneh')
    render(<App />)
    await user.click(screen.getByText('Masuk'))
    await user.click(screen.getByText('tutup-modal'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByText('Masuk'))
    await user.click(screen.getByText('login-admin'))
    expect(window.location.pathname).toBe('/admin')
    expect(screen.getByText('Panel Admin')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('member tidak boleh membuka /admin', async () => {
    setSession('tok', member)
    goTo('/admin')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/author'))
  })

  it('logout: batal, berhasil, dan tetap keluar walau API gagal', async () => {
    const user = userEvent.setup()
    setSession('tok', member)
    goTo('/author')
    render(<App />)
    expect(screen.getByText('Workspace Budi')).toBeInTheDocument()

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    await user.click(screen.getByLabelText('Keluar'))
    expect(logout).not.toHaveBeenCalled()

    logout.mockRejectedValueOnce(new Error('offline'))
    await user.click(screen.getByLabelText('Keluar'))
    await waitFor(() => expect(window.location.pathname).toBe('/'))
    expect(getToken()).toBeNull()
    expect(screen.getByText('Auth login')).toBeInTheDocument()
  })

  it('sesi kedaluwarsa (401) mengeluarkan pengguna', async () => {
    setSession('tok', member)
    goTo('/author')
    render(<App />)
    act(() => window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT)))
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('tema dapat diganti dari navbar', async () => {
    const user = userEvent.setup()
    setSession('tok', member)
    render(<App />)
    await user.click(screen.getByLabelText('Ganti tema'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    await user.click(screen.getByLabelText('Ganti warna aksen'))
  })
})
