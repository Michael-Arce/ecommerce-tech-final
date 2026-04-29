import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const OrderHistoryPage = lazy(() => import('@/pages/account/order-history-page').then((m) => ({ default: m.OrderHistoryPage })))

export const Route = createFileRoute('/account/orders/')({
  component: OrderHistoryPage,
})
