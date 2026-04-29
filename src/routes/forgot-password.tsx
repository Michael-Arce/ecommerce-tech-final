import { createFileRoute, redirect } from '@tanstack/react-router'
import { lazy } from 'react'
import { useAuthStore } from '@/features/authenticate'

const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password-page').then((m) => ({ default: m.ForgotPasswordPage })))

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) throw redirect({ to: '/' })
  },
  component: ForgotPasswordPage,
})
