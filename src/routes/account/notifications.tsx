import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const NotificationsPage = lazy(() => import('@/pages/account/notifications-page').then((m) => ({ default: m.NotificationsPage })))

export const Route = createFileRoute('/account/notifications')({
  component: NotificationsPage,
})
