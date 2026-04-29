import { useAuthStore } from '@/features/authenticate'

/**
 * Auth-agnostic hook. All admin/feature components consume this.
 * When we switch to JWT, only this hook changes internally.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.role)
  return { user, isAuthenticated, role, isAdmin: role === 'admin' }
}
