import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const PasswordChangePage = lazy(() => import('@/pages/account/password-change-page').then((m) => ({ default: m.PasswordChangePage })))

export const Route = createFileRoute('/account/password')({
  component: PasswordChangePage,
})
