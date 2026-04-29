import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-instance'
import { setAccessToken } from '@/shared/api/axios-instance'
import { meQueryOptions } from '@/routes/-meQueryOptions'
import type { User } from '@/entities/user'
import { useAuthStore } from './auth-store'

interface LoginPayload {
  email: string
  password: string
}

interface AuthResponse {
  data: User
  accessToken: string
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiClient.post<AuthResponse>('/api/auth/login', payload).then((r) => r.data),

    onSuccess: ({ data, accessToken }) => {
      setAccessToken(accessToken)
      setUser(data, accessToken)
      queryClient.setQueryData(meQueryOptions.queryKey, { data })
    },
  })
}
