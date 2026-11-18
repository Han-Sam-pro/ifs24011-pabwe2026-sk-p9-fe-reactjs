import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StickyNavbar from './StickyNavbar'

const handlers = () => ({
  onNavigate: vi.fn(),
  onLoginClick: vi.fn(),
  onLogout: vi.fn(),
  onToggleTheme: vi.fn(),
  onCycleAccent: vi.fn(),
})

describe('StickyNavbar', () => {
  it('tamu: tombol Masuk & Daftar, ganti tema/aksen', async () => {
    const user = userEvent.setup()
    const h = handlers()
    render(<StickyNavbar user={null} currentPath="/" isDark={false} {...h} />)
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
    await user.click(screen.getByText('Masuk'))
    expect(h.onLoginClick).toHaveBeenCalled()
    await user.click(screen.getByText('Daftar'))
    expect(h.onNavigate).toHaveBeenCalledWith('/register')
    await user.click(screen.getByText('Beranda'))
    expect(h.onNavigate).toHaveBeenCalledWith('/')
    await user.click(screen.getByText('Blog'))
    await user.click(screen.getByLabelText('Ganti tema'))
    expect(h.onToggleTheme).toHaveBeenCalled()
    await user.click(screen.getByLabelText('Ganti warna aksen'))
    expect(h.onCycleAccent).toHaveBeenCalled()
  })

  it('member: Workspace tanpa Admin, dapat logout', async () => {
    const user = userEvent.setup()
    const h = handlers()
    render(<StickyNavbar user={{ name: 'budi', role: 'member' }} currentPath="/author" isDark {...h} />)
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    await user.click(screen.getByText('Workspace'))
    expect(h.onNavigate).toHaveBeenCalledWith('/author')
    await user.click(screen.getByLabelText('Keluar'))
    expect(h.onLogout).toHaveBeenCalled()
  })

  it('admin: menu Admin aktif', async () => {
    const user = userEvent.setup()
    const h = handlers()
    render(<StickyNavbar user={{ name: 'Administrator', role: 'admin' }} currentPath="/admin" isDark={false} {...h} />)
    await user.click(screen.getByText('Admin'))
    expect(h.onNavigate).toHaveBeenCalledWith('/admin')
  })
})
