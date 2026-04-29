import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const CheckoutPage = lazy(() => import('@/pages/checkout/checkout-page').then((m) => ({ default: m.CheckoutPage })))

export const Route = createFileRoute('/checkout/')({
  component: CheckoutPage,
})
