import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { z } from 'zod'

const CatalogPage = lazy(() => import('@/pages/catalog/catalog-page').then((m) => ({ default: m.CatalogPage })))

const catalogSearchSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
})

export const Route = createFileRoute('/catalog/')({
  validateSearch: catalogSearchSchema,
  component: CatalogPage,
})
