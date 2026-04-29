import { apiClient } from '@/shared/api/axios-instance'
import type { ApiResponse } from '@/shared/types/api.types'
import type { User, UserRole } from '../model/user.types'

export function getMe(): Promise<ApiResponse<User>> {
  return apiClient.get<ApiResponse<User>>('/api/auth/me').then((r) => r.data)
}

export function updateProfile(
  data: Partial<Pick<User, 'firstName' | 'lastName'>>,
): Promise<ApiResponse<User>> {
  return apiClient.patch<ApiResponse<User>>('/api/auth/me', data).then((r) => r.data)
}

export function getUsers(): Promise<ApiResponse<User[]>> {
  return apiClient.get<ApiResponse<User[]>>('/api/users').then((r) => r.data)
}

export function updateUser(
  id: string,
  data: { role?: UserRole; firstName?: string; lastName?: string },
): Promise<ApiResponse<User>> {
  return apiClient.patch<ApiResponse<User>>(`/api/users/${id}`, data).then((r) => r.data)
}

export function deleteUser(id: string): Promise<void> {
  return apiClient.delete(`/api/users/${id}`).then(() => undefined)
}

export function changePassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<{ message: string }> {
  return apiClient
    .patch<{ message: string }>('/api/auth/me/password', data)
    .then((r) => r.data)
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiClient
    .post<{ message: string }>('/api/auth/forgot-password', { email })
    .then((r) => r.data)
}

export function resetPassword(data: {
  token: string
  password: string
}): Promise<{ message: string }> {
  return apiClient
    .post<{ message: string }>('/api/auth/reset-password', data)
    .then((r) => r.data)
}
