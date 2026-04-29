import { createFileRoute } from '@tanstack/react-router'
import { ProductsListPage } from '@/pages/admin/products-list-page'

export const Route = createFileRoute('/admin/products/')({
  component: ProductsListPage,
})
