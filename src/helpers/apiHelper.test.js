import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  ApiError,
  AUTH_EXPIRED_EVENT,
  apiRequest,
  clearSession,
  getBaseUrl,
  getToken,
  getUser,
  setSession,
  TOKEN_KEY,
  updateStoredUser,
  USER_KEY,
} from './apiHelper'

const jsonResponse = (status, body) => ({ ok: status < 400, status, json: () => Promise.resolve(body) })

describe('apiHelper', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  it('getBaseUrl membaca env dan menghapus slash akhir', () => {
    expect(getBaseUrl({ VITE_API_BASE_URL: 'https://api.test//' })).toBe('https://api.test')
    expect(getBaseUrl({})).toBe('')
    expect(typeof getBaseUrl()).toBe('string')
  })

  it('mengelola sesi di localStorage', () => {
    expect(getUser()).toBeNull()
    setSession('tok', { id: 1, name: 'Budi' })
    expect(getToken()).toBe('tok')
    expect(getUser()).toEqual({ id: 1, name: 'Budi' })
    updateStoredUser({ id: 1, name: 'Budi S' })
    expect(getUser().name).toBe('Budi S')
    localStorage.setItem(USER_KEY, '{rusak')
    expect(getUser()).toBeNull()
    clearSession()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('mengirim body JSON dan token bearer', async () => {
    setSession('abc', { id: 1 })
    fetch.mockResolvedValue(jsonResponse(200, { status: 'success', message: 'ok', data: { id: 9 } }))
    const data = await apiRequest('/api/posts', { method: 'POST', body: { title: 'x' } })
    expect(data).toEqual({ id: 9 })
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/api/posts')
    expect(options.headers.Authorization).toBe('Bearer abc')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe('{"title":"x"}')
  })

  it('tidak mengirim token jika auth=false atau token kosong', async () => {
    fetch.mockResolvedValue(jsonResponse(200, { status: 'success', data: [] }))
    await apiRequest('/api/public/posts')
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
    setSession('abc', {})
    await apiRequest('/api/public/posts', { auth: false })
    expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined()
    expect(fetch.mock.calls[1][1].body).toBeUndefined()
  })

  it('melempar ApiError saat jaringan gagal', async () => {
    fetch.mockRejectedValue(new Error('offline'))
    await expect(apiRequest('/x')).rejects.toMatchObject({ name: 'ApiError', status: 0 })
  })

  it('melempar pesan dari backend atau fallback', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(400, { status: 'fail', message: 'Data tidak valid' }))
    await expect(apiRequest('/x')).rejects.toThrow('Data tidak valid')

    fetch.mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.reject(new Error('bukan json')) })
    await expect(apiRequest('/x')).rejects.toThrow('Permintaan gagal (500)')

    fetch.mockResolvedValueOnce(jsonResponse(200, { status: 'error' }))
    await expect(apiRequest('/x')).rejects.toBeInstanceOf(ApiError)
  })

  it('401 dengan token menghapus sesi dan memicu event', async () => {
    const listener = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, listener)
    setSession('expired', { id: 1 })
    fetch.mockResolvedValue(jsonResponse(401, { status: 'fail', message: 'Token tidak valid' }))
    await expect(apiRequest('/api/posts')).rejects.toMatchObject({ status: 401 })
    expect(getToken()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(1)

    // tanpa token / auth=false -> tidak memicu event
    await expect(apiRequest('/api/auth/login', { auth: false })).rejects.toThrow()
    await expect(apiRequest('/api/posts')).rejects.toThrow()
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(AUTH_EXPIRED_EVENT, listener)
  })

  it('401 saat auth=false tidak menghapus token', async () => {
    setSession('tok', { id: 1 })
    fetch.mockResolvedValue(jsonResponse(401, { status: 'fail', message: 'salah' }))
    await expect(apiRequest('/api/auth/login', { auth: false })).rejects.toThrow('salah')
    expect(getToken()).toBe('tok')
  })
})
