import { PageTitle } from '@/shared/ui'
import { OrdersTable } from '@/features/order-management'

export function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Orders</PageTitle>
      <OrdersTable />
    </div>
  )
}
