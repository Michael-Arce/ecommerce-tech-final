import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const BrandsPage = lazy(() => import('@/pages/catalog/brands-page').then((m) => ({ default: m.BrandsPage })))

export const Route = createFileRoute('/brands/')({
  component: BrandsPage,
})
