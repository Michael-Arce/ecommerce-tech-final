import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const ProductFormPage = lazy(() => import('@/pages/admin/product-form-page').then((m) => ({ default: m.ProductFormPage })))

export const Route = createFileRoute('/admin/products/new')({
  component: ProductFormPage,
})
