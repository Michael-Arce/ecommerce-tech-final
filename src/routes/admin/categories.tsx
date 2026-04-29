import { createFileRoute } from '@tanstack/react-router'
import { CategoriesPage } from '@/pages/admin/categories-page'

export const Route = createFileRoute('/admin/categories')({
  component: CategoriesPage,
})
