import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/features/authenticate'
import { LoginPage } from '@/pages/auth/login-page'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) throw redirect({ to: '/' })
  },
  component: LoginPage,
})
