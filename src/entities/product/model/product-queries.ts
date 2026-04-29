import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProductFilters } from './product.types'
import {
  getProducts,
  getProductBySlug,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getSimilarProducts,
  type CreateProductPayload,
} from '../api/product-api'
import type { SearchParams } from './product.types'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  adminAll: () => [...productKeys.all, 'admin-all'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  search: (params: SearchParams) => ['semantic-search', params] as const,
  similar: (id: string) => ['similar-products', id] as const,
} as const

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
  })
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: productKeys.adminAll(),
    queryFn: getAllProductsAdmin,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProductPayload> }) =>
      updateProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useSemanticSearch(params: SearchParams) {
  const hasQuery = Boolean(params.q && params.q.trim().length >= 2)
  return useQuery({
    queryKey: productKeys.search(params),
    queryFn: () => searchProducts(params),
    enabled: hasQuery,
  })
}

export function useSimilarProducts(productId: string | undefined) {
  return useQuery({
    queryKey: productKeys.similar(productId ?? ''),
    queryFn: () => getSimilarProducts(productId!),
    enabled: Boolean(productId),
  })
}
