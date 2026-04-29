import { create } from 'zustand'
import { registerRefreshFailureHandler, setAccessToken, getAccessToken } from '@/shared/api/axios-instance'
import type { User, UserRole } from '@/entities/user'

function parseTokenRole(token: string): UserRole {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.role === 'admin' ? 'admin' : 'customer'
  } catch {
    return 'customer'
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  role: UserRole | null
  setUser: (user: User, accessToken?: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  role: null,

  setUser: (user, accessToken) => {
    const token = accessToken ?? getAccessToken() ?? ''
    set({ user, isAuthenticated: true, role: parseTokenRole(token) })
  },
  clearAuth: () => set({ user: null, isAuthenticated: false, role: null }),
}))

// Register the refresh failure handler so axios-instance can clear auth
// without importing from this feature (FSD boundary compliance).
registerRefreshFailureHandler(() => {
  const wasAuthenticated = useAuthStore.getState().isAuthenticated
  setAccessToken(null)
  useAuthStore.getState().clearAuth()
  // Only force-redirect when the user had an active session and their refresh
  // token expired mid-session. On initial page load isAuthenticated is false,
  // so we skip the redirect and let route guards handle it normally.
  if (wasAuthenticated) {
    window.location.href = '/login'
  }
})
