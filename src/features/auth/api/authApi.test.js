import { describe, it, expect, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { getProfile, login, logout, register, updateProfile } from './authApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn(() => Promise.resolve('ok')) }))

describe('authApi', () => {
  it('memanggil endpoint auth yang benar', async () => {
    await login('budi', 'rahasia')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/auth/login', { method: 'POST', body: { username: 'budi', password: 'rahasia' }, auth: false })
    await register({ username: 'budi' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/auth/register', { method: 'POST', body: { username: 'budi' }, auth: false })
    await logout()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/auth/logout', { method: 'POST' })
    await getProfile()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/auth/profile')
    await updateProfile({ name: 'B' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/auth/profile', { method: 'PUT', body: { name: 'B' } })
  })
})
