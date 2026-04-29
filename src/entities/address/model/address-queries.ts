import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../api/address-api'
import type { Address } from './address.types'

export const addressKeys = {
  all: ['addresses'] as const,
  lists: () => [...addressKeys.all, 'list'] as const,
  list: () => [...addressKeys.lists()] as const,
  details: () => [...addressKeys.all, 'detail'] as const,
  detail: (id: string) => [...addressKeys.details(), id] as const,
} as const

export function useAddresses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: getAddresses,
    enabled: options?.enabled ?? true,
    select: (res) => res.data,
  })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Address, 'id' | 'userId'>) => createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() })
    },
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => updateAddress(id, { isDefault: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() })
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() })
    },
  })
}
