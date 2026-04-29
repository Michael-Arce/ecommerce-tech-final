import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const BrandCatalogPage = lazy(() => import('@/pages/catalog/brand-catalog-page').then((m) => ({ default: m.BrandCatalogPage })))

export const Route = createFileRoute('/brands/$brandSlug')({
  component: BrandCatalogPage,
})
