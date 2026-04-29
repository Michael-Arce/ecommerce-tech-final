import { apiClient } from '@/shared/api/axios-instance'
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types'
import type { Product, ProductFilters, SearchParams, SearchProduct, SearchResponse } from '../model/product.types'

export function getProducts(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
  return apiClient.get<PaginatedResponse<Product>>('/api/products', { params: filters }).then((r) => r.data)
}

export function getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
  return apiClient.get<ApiResponse<Product>>(`/api/products/${slug}`).then((r) => r.data)
}

export function getAllProductsAdmin(): Promise<ApiResponse<Product[]>> {
  return apiClient.get<ApiResponse<Product[]>>('/api/products/admin/all').then((r) => r.data)
}

export interface VariantPayload {
  sku: string
  name: string
  price: number
  stock: number
  imageUrl?: string
}

export interface CreateProductPayload {
  name: string
  description: string
  price: number
  compareAtPrice?: number
  stock: number
  categoryId: string
  brandId?: string
  imageUrl?: string
  imageUrls?: string[]
  isActive?: boolean
  variants?: VariantPayload[]
}

export function createProduct(payload: CreateProductPayload): Promise<ApiResponse<Product>> {
  return apiClient.post<ApiResponse<Product>>('/api/products', payload).then((r) => r.data)
}

export function updateProduct(id: string, payload: Partial<CreateProductPayload>): Promise<ApiResponse<Product>> {
  return apiClient.patch<ApiResponse<Product>>(`/api/products/${id}`, payload).then((r) => r.data)
}

export function deleteProduct(id: string): Promise<void> {
  return apiClient.delete(`/api/products/${id}`).then(() => undefined)
}

export function searchProducts(params: SearchParams): Promise<ApiResponse<SearchResponse>> {
  return apiClient.get<ApiResponse<SearchResponse>>('/api/search', { params }).then((r) => r.data)
}

export function getSimilarProducts(productId: string, limit = 6): Promise<ApiResponse<SearchProduct[]>> {
  return apiClient.get<ApiResponse<SearchProduct[]>>(`/api/products/${productId}/similar`, { params: { limit } }).then((r) => r.data)
}
