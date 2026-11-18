import { apiRequest } from '../../../helpers/apiHelper'

export function buildQuery({ q = '', category = '' } = {}) {
  const params = new URLSearchParams()
  if (q.trim()) params.set('q', q.trim())
  if (category && category !== 'Semua') params.set('category', category)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

// ---- Publik ----
export const getCategories = () => apiRequest('/api/public/categories', { auth: false })
export const getPublicPosts = (filter) => apiRequest(`/api/public/posts${buildQuery(filter)}`, { auth: false })
export const getPublicPost = (slug) => apiRequest(`/api/public/posts/${encodeURIComponent(slug)}`, { auth: false })

// ---- Penulis ----
export const getMyPosts = (filter) => apiRequest(`/api/posts${buildQuery(filter)}`)
export const getMyPost = (id) => apiRequest(`/api/posts/${id}`)
export const getStats = () => apiRequest('/api/posts/stats')
export const createPost = (payload) => apiRequest('/api/posts', { method: 'POST', body: payload })
export const updatePost = (id, payload) => apiRequest(`/api/posts/${id}`, { method: 'PUT', body: payload })
export const togglePublish = (id) => apiRequest(`/api/posts/${id}/toggle-publish`, { method: 'PATCH' })
export const deletePost = (id) => apiRequest(`/api/posts/${id}`, { method: 'DELETE' })

// ---- AI Generator ----
export const generateWithAi = (payload) => apiRequest('/api/posts/ai-generate', { method: 'POST', body: payload })
