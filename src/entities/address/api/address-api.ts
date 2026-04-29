import { apiClient } from '@/shared/api/axios-instance'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Address } from '../model/address.types'

export function getAddresses(): Promise<ApiResponse<Address[]>> {
  return apiClient.get<ApiResponse<Address[]>>('/api/addresses').then((r) => r.data)
}

export function createAddress(
  data: Omit<Address, 'id' | 'userId'>,
): Promise<ApiResponse<Address>> {
  return apiClient.post<ApiResponse<Address>>('/api/addresses', data).then((r) => r.data)
}

export function updateAddress(
  id: string,
  data: Partial<Address>,
): Promise<ApiResponse<Address>> {
  return apiClient.patch<ApiResponse<Address>>(`/api/addresses/${id}`, data).then((r) => r.data)
}

export function deleteAddress(id: string): Promise<void> {
  return apiClient.delete(`/api/addresses/${id}`).then(() => undefined)
}
