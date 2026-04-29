import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const OrderDetailPage = lazy(() => import('@/pages/account/order-detail-page').then((m) => ({ default: m.OrderDetailPage })))

export const Route = createFileRoute('/account/orders/$orderId')({
  component: OrderDetailPage,
})
