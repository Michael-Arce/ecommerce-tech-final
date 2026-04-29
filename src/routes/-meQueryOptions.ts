import { queryOptions } from '@tanstack/react-query'
import { getMe } from '@/entities/user'

export const meQueryOptions = queryOptions({
  queryKey: ['auth', 'me'],
  queryFn: getMe,
  staleTime: Infinity,
  retry: false,
})
