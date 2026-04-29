import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, setAccessToken } from '@/shared/api/axios-instance'
import { meQueryOptions } from '@/routes/-meQueryOptions'
import type { User } from '@/entities/user'
import { useAuthStore } from './auth-store'

interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface AuthResponse {
  data: User
  accessToken: string
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      apiClient.post<AuthResponse>('/api/auth/register', payload).then((r) => r.data),

    onSuccess: ({ data, accessToken }) => {
      setAccessToken(accessToken)
      setUser(data, accessToken)
      queryClient.setQueryData(meQueryOptions.queryKey, { data })
    },
  })
}
