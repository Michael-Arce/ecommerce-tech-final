import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const WishlistPage = lazy(() => import('@/pages/account/wishlist-page').then((m) => ({ default: m.WishlistPage })))

export const Route = createFileRoute('/account/wishlist')({
  component: WishlistPage,
})
