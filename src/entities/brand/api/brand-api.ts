import { apiClient } from '@/shared/api/axios-instance'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Brand } from '../model/brand.types'

export interface BrandPayload {
  name: string
  slug: string
  tagline: { en: string; es: string }
  bgColor: string
  logoUrl?: string
}

export function getBrands(): Promise<ApiResponse<Brand[]>> {
  return apiClient.get<ApiResponse<Brand[]>>('/api/brands').then((r) => r.data)
}

export function getBrandBySlug(slug: string): Promise<ApiResponse<Brand>> {
  return apiClient.get<ApiResponse<Brand>>(`/api/brands/${slug}`).then((r) => r.data)
}

export function createBrand(payload: BrandPayload): Promise<ApiResponse<Brand>> {
  return apiClient.post<ApiResponse<Brand>>('/api/brands', payload).then((r) => r.data)
}

export function updateBrand(id: string, payload: Partial<BrandPayload>): Promise<ApiResponse<Brand>> {
  return apiClient.patch<ApiResponse<Brand>>(`/api/brands/${id}`, payload).then((r) => r.data)
}

export function deleteBrand(id: string): Promise<void> {
  return apiClient.delete(`/api/brands/${id}`).then(() => undefined)
}
