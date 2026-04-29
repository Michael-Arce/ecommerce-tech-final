import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const ProfilePage = lazy(() => import('@/pages/account/profile-page').then((m) => ({ default: m.ProfilePage })))

export const Route = createFileRoute('/account/profile')({
  component: ProfilePage,
})
