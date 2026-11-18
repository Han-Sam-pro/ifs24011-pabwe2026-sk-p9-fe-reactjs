import { apiRequest } from '../../../helpers/apiHelper'

export const login = (username, password) =>
  apiRequest('/api/auth/login', { method: 'POST', body: { username, password }, auth: false })

export const register = (payload) =>
  apiRequest('/api/auth/register', { method: 'POST', body: payload, auth: false })

export const logout = () => apiRequest('/api/auth/logout', { method: 'POST' })

export const getProfile = () => apiRequest('/api/auth/profile')

export const updateProfile = (payload) => apiRequest('/api/auth/profile', { method: 'PUT', body: payload })
