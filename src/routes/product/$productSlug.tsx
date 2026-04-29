import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const ProductDetailPage = lazy(() => import('@/pages/catalog/product-detail-page').then((m) => ({ default: m.ProductDetailPage })))

export const Route = createFileRoute('/product/$productSlug')({
  component: ProductDetailPage,
})
