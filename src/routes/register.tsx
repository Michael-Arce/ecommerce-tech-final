import { createFileRoute, redirect } from '@tanstack/react-router'
import { lazy } from 'react'
import { useAuthStore } from '@/features/authenticate'

const RegisterPage = lazy(() => import('@/pages/auth/register-page').then((m) => ({ default: m.RegisterPage })))

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) throw redirect({ to: '/' })
  },
  component: RegisterPage,
})
