import { useOrders, useUpdateOrderStatus } from '@/entities/order'
import type { OrderStatus } from '@/entities/order'

export function useOrderManagement() {
  const { data: orders = [] } = useOrders()
  const { mutateAsync, isPending, variables } = useUpdateOrderStatus()

  const pendingId = isPending ? (variables?.id ?? null) : null

  async function changeStatus(orderId: string, status: OrderStatus) {
    await mutateAsync({ id: orderId, status })
  }

  return { orders, changeStatus, pendingId }
}
