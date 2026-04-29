import { createFileRoute } from '@tanstack/react-router'
import { AdminOrdersPage } from '@/pages/admin/admin-orders-page'

export const Route = createFileRoute('/admin/orders/')({
  component: AdminOrdersPage,
})
