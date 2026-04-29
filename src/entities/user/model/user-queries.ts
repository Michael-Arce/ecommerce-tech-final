import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, getUsers, updateUser, updateProfile, changePassword, deleteUser, forgotPassword, resetPassword } from '../api/user-api'
import type { User, UserRole } from './user.types'
import { useNotificationStore } from '@/entities/notification'

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  list: () => [...userKeys.all, 'list'] as const,
} as const

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getMe,
  })
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: getUsers,
    select: (res) => res.data,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Pick<User, 'firstName' | 'lastName'>>) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() })
      useNotificationStore.getState().addNotification('Profile updated successfully', 'account')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => changePassword(data),
    onSuccess: () => {
      useNotificationStore.getState().addNotification('Password changed successfully', 'account')
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: UserRole; firstName?: string; lastName?: string } }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() })
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) => resetPassword(data),
  })
}
