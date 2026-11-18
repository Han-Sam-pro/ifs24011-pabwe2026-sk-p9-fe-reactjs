import { apiRequest } from '../../../helpers/apiHelper'

export const getUsers = () => apiRequest('/api/admin/users')
export const getAllPosts = () => apiRequest('/api/admin/posts')
export const getUserPosts = (userId) => apiRequest(`/api/admin/users/${userId}/posts`)
