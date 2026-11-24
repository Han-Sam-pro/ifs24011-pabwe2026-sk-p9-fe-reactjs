import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import AuthPage from './AuthPage'
import { login, register } from '../api/authApi'

vi.mock('../api/authApi', () => ({ login: vi.fn(), register: vi.fn() }))

describe('AuthPage - login', () => {
  it('memiliki input wajib dan login berhasil', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    const onNavigate = vi.fn()
    login.mockResolvedValue({ token: 't', user: { id: 1 } })
    render(<AuthPage mode="login" onLogin={onLogin} onNavigate={onNavigate} />)

    await user.type(document.getElementById('login-username'), ' budi ')
    await user.type(document.getElementById('login-password'), 'rahasia')
    await user.click(document.getElementById('login-submit'))
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith({ token: 't', user: { id: 1 } }))
    expect(login).toHaveBeenCalledWith('budi', 'rahasia')

    await user.click(screen.getByText('Daftar sebagai penulis'))
    expect(onNavigate).toHaveBeenCalledWith('/register')
    await user.click(screen.getByText('Kembali ke beranda'))
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('menampilkan error saat login gagal', async () => {
    const user = userEvent.setup()
    login.mockRejectedValue(new Error('username atau password salah'))
    render(<AuthPage mode="login" onLogin={vi.fn()} onNavigate={vi.fn()} />)
    await user.type(screen.getByLabelText('Username atau Email'), 'x')
    await user.type(screen.getByLabelText('Password'), 'y')
    await user.click(screen.getByRole('button', { name: /masuk/i }))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'username atau password salah' })))
    expect(document.getElementById('login-submit')).not.toBeDisabled()
  })
})

describe('AuthPage - halaman awal', () => {
  it('menyembunyikan tautan beranda saat showHomeLink=false', () => {
    render(<AuthPage mode="login" onLogin={vi.fn()} onNavigate={vi.fn()} showHomeLink={false} />)
    expect(screen.queryByText('Kembali ke beranda')).not.toBeInTheDocument()
    expect(document.getElementById('login-username')).toBeInTheDocument()
  })
})

describe('AuthPage - register', () => {
  async function fill(user, { username = 'budi', password = 'rahasia', confirm = 'rahasia' } = {}) {
    await user.type(screen.getByLabelText('Nama Lengkap'), 'Budi Santoso')
    await user.type(screen.getByLabelText('Username'), username)
    await user.type(screen.getByLabelText('Email'), 'budi@x.com')
    await user.type(screen.getByLabelText('Password'), password)
    await user.type(screen.getByLabelText('Konfirmasi Password'), confirm)
    await user.click(document.getElementById('register-submit'))
  }

  it('validasi username, panjang password, dan konfirmasi', async () => {
    const user = userEvent.setup()
    render(<AuthPage mode="register" onLogin={vi.fn()} onNavigate={vi.fn()} />)
    await fill(user, { username: 'b!' })
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: expect.stringContaining('Username') }))
    expect(register).not.toHaveBeenCalled()
  })

  it('password terlalu pendek', async () => {
    const user = userEvent.setup()
    render(<AuthPage mode="register" onLogin={vi.fn()} onNavigate={vi.fn()} />)
    await fill(user, { password: '123', confirm: '123' })
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Password minimal 6 karakter.' }))
  })

  it('konfirmasi tidak sama', async () => {
    const user = userEvent.setup()
    render(<AuthPage mode="register" onLogin={vi.fn()} onNavigate={vi.fn()} />)
    await fill(user, { confirm: 'berbeda' })
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Konfirmasi password tidak sama.' }))
  })

  it('registrasi berhasil lalu diarahkan ke login', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    register.mockResolvedValue({ id: 2 })
    render(<AuthPage mode="register" onLogin={vi.fn()} onNavigate={onNavigate} />)
    await fill(user)
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('/login'))
    expect(register).toHaveBeenCalledWith({ name: 'Budi Santoso', username: 'budi', email: 'budi@x.com', password: 'rahasia' })
  })

  it('registrasi gagal dan tautan ke login', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    register.mockRejectedValue(new Error('username atau email sudah digunakan'))
    render(<AuthPage mode="register" onLogin={vi.fn()} onNavigate={onNavigate} />)
    await fill(user)
    await waitFor(() => expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Registrasi Gagal' })))
    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(onNavigate).toHaveBeenCalledWith('/login')
  })
})
