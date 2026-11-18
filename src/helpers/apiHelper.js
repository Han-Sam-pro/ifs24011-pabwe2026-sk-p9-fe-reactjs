// Wrapper fetch terpusat: menyuntikkan Bearer token dan mengurai respons
// standar backend {status, message, data?}.

export const TOKEN_KEY = 'delcom_blog_token'
export const USER_KEY = 'delcom_blog_user'
export const AUTH_EXPIRED_EVENT = 'delcom:auth-expired'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getBaseUrl(env = import.meta.env) {
  return (env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function updateStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  const options = { method, headers }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }
  const token = getToken()
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${getBaseUrl()}${path}`, options)
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.', 0)
  }

  const json = await res.json().catch(() => null)
  if (!res.ok || json?.status !== 'success') {
    if (res.status === 401 && auth && token) {
      clearSession()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    throw new ApiError(json?.message || `Permintaan gagal (${res.status})`, res.status)
  }
  return json.data
}
