import { createFileRoute, redirect } from '@tanstack/react-router'
import { AccountLayout } from '@/app/layouts/account-layout'
import { useAuthStore } from '@/features/authenticate'

export const Route = createFileRoute('/account')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, role } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login', search: { returnUrl: location.href } })
    }
    if (role === 'admin') {
      throw redirect({ to: '/admin/dashboard' })
    }
  },
  component: AccountLayout,
})
