import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { z } from 'zod'

const SearchPage = lazy(() => import('@/pages/catalog/search-page').then((m) => ({ default: m.SearchPage })))

export const Route = createFileRoute('/search')({
  validateSearch: z.object({ q: z.string().optional() }),
  component: SearchPage,
})
