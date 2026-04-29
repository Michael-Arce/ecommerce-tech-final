import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const CartPage = lazy(() => import('@/pages/checkout/cart-page').then((m) => ({ default: m.CartPage })))

export const Route = createFileRoute('/cart')({
  component: CartPage,
})
