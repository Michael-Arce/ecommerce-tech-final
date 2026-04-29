import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const CatalogPage = lazy(() => import('@/pages/catalog/catalog-page').then((m) => ({ default: m.CatalogPage })))

export const Route = createFileRoute('/catalog/$categorySlug/$subcategorySlug')({
  component: CatalogPage,
})
