import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLayout } from '@/app/layouts/admin-layout'
import { useAuthStore } from '@/features/authenticate'

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, role } = useAuthStore.getState()
    if (!isAuthenticated) throw redirect({ to: '/login', search: { returnUrl: location.href } })
    if (role !== 'admin') throw redirect({ to: '/' })
  },
  component: AdminLayout,
})
