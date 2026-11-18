import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from './AuthModal'

vi.mock('../api/authApi', () => ({ login: vi.fn(), register: vi.fn() }))

describe('AuthModal', () => {
  it('menampilkan form login dan dapat ditutup / pindah ke register', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onNavigate = vi.fn()
    render(<AuthModal onClose={onClose} onLogin={vi.fn()} onNavigate={onNavigate} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(document.getElementById('login-username')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Tutup'))
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Daftar sebagai penulis'))
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(onNavigate).toHaveBeenCalledWith('/register')
  })
})
