import { describe, it, expect, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import * as api from './blogApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn(() => Promise.resolve([])) }))

describe('blogApi', () => {
  it('buildQuery', () => {
    expect(api.buildQuery()).toBe('')
    expect(api.buildQuery({ q: '  ', category: 'Semua' })).toBe('')
    expect(api.buildQuery({ q: ' golang ', category: 'Gaya Hidup' })).toBe('?q=golang&category=Gaya+Hidup')
  })

  it('endpoint publik', async () => {
    await api.getCategories()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/categories', { auth: false })
    await api.getPublicPosts({ q: 'ai' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts?q=ai', { auth: false })
    await api.getPublicPost('halo dunia')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts/halo%20dunia', { auth: false })
  })

  it('endpoint penulis & AI', async () => {
    await api.getMyPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts')
    await api.getMyPost(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3')
    await api.getStats()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/stats')
    await api.createPost({ title: 'a' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts', { method: 'POST', body: { title: 'a' } })
    await api.updatePost(3, { title: 'b' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3', { method: 'PUT', body: { title: 'b' } })
    await api.togglePublish(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3/toggle-publish', { method: 'PATCH' })
    await api.deletePost(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3', { method: 'DELETE' })
    await api.generateWithAi({ topic: 'x' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/ai-generate', { method: 'POST', body: { topic: 'x' } })
  })
})
