import { createFileRoute } from '@tanstack/react-router'
import { BrandsPage } from '@/pages/admin/brands-page'

export const Route = createFileRoute('/admin/brands')({
  component: BrandsPage,
})
