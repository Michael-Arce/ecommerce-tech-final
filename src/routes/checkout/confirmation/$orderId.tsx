import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const ConfirmationPage = lazy(() => import('@/pages/checkout/confirmation-page').then((m) => ({ default: m.ConfirmationPage })))

export const Route = createFileRoute('/checkout/confirmation/$orderId')({
  component: ConfirmationPage,
})
