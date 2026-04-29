import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getBrands, getBrandBySlug,
  createBrand, updateBrand, deleteBrand,
  type BrandPayload,
} from '../api/brand-api'

export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: () => [...brandKeys.lists()] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (slug: string) => [...brandKeys.details(), slug] as const,
} as const

export function useBrands() {
  return useQuery({
    queryKey: brandKeys.list(),
    queryFn: getBrands,
  })
}

export function useBrandBySlug(slug: string) {
  return useQuery({
    queryKey: brandKeys.detail(slug),
    queryFn: () => getBrandBySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BrandPayload) => createBrand(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: brandKeys.lists() }),
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BrandPayload> }) =>
      updateBrand(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: brandKeys.lists() }),
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: brandKeys.lists() }),
  })
}
