import { apiClient } from '@/shared/api/axios-instance'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Category } from '../model/category.types'

export interface CategoryPayload {
  name: string
  slug: string
}

export function getCategories(): Promise<ApiResponse<Category[]>> {
  return apiClient.get<ApiResponse<Category[]>>('/api/categories').then((r) => r.data)
}

export function getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
  return apiClient.get<ApiResponse<Category>>(`/api/categories/${slug}`).then((r) => r.data)
}

export function createCategory(payload: CategoryPayload): Promise<ApiResponse<Category>> {
  return apiClient.post<ApiResponse<Category>>('/api/categories', payload).then((r) => r.data)
}

export function updateCategory(id: string, payload: Partial<CategoryPayload>): Promise<ApiResponse<Category>> {
  return apiClient.patch<ApiResponse<Category>>(`/api/categories/${id}`, payload).then((r) => r.data)
}

export function deleteCategory(id: string): Promise<void> {
  return apiClient.delete(`/api/categories/${id}`).then(() => undefined)
}
