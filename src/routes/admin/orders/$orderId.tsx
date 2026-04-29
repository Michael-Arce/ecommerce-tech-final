import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const AdminOrderDetailPage = lazy(() => import('@/pages/admin/admin-order-detail-page').then((m) => ({ default: m.AdminOrderDetailPage })))

export const Route = createFileRoute('/admin/orders/$orderId')({
  component: AdminOrderDetailPage,
})
