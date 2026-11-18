import { describe, it, expect, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { getAllPosts, getUserPosts, getUsers } from './adminApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn(() => Promise.resolve([])) }))

describe('adminApi', () => {
  it('memanggil endpoint admin', async () => {
    await getUsers()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/users')
    await getAllPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/posts')
    await getUserPosts(7)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/users/7/posts')
  })
})
