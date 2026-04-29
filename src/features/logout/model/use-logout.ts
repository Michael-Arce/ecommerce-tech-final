import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { apiClient, setAccessToken } from '@/shared/api/axios-instance'
import { queryClient } from '@/shared/api/query-client'
import { useAuthStore } from '@/features/authenticate'
import { useWishlistStore } from '@/entities/wishlist'
import { useCartStore } from '@/entities/cart'
import { useNotificationStore } from '@/entities/notification'

export function useLogout() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const clearWishlist = useWishlistStore((s) => s.clearWishlist)
  const clearCart = useCartStore((s) => s.clearCart)
  const clearNotifications = useNotificationStore((s) => s.clearNotifications)

  return useMutation({
    mutationFn: () => apiClient.post('/api/auth/logout').then(() => undefined),
    onSettled: () => {
      setAccessToken(null)
      clearAuth()
      queryClient.clear()
      clearWishlist()
      clearCart()
      clearNotifications()
      void navigate({ to: '/' })
    },
  })
}
