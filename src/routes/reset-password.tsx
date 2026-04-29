import { createFileRoute, redirect } from '@tanstack/react-router'
import { lazy } from 'react'
import { useAuthStore } from '@/features/authenticate'

const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password-page').then((m) => ({ default: m.ResetPasswordPage })))

export const Route = createFileRoute('/reset-password')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) throw redirect({ to: '/' })
  },
  component: ResetPasswordPage,
})
