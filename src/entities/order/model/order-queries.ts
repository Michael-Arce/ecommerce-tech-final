import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getOrders,
  getOrderById,
  placeOrder,
  cancelOrder,
  updateOrderStatus,
  type PlaceOrderPayload,
} from '../api/order-api'
import type { OrderStatus } from './order.types'
import { useNotificationStore } from '@/entities/notification'

const STATUS_LABELS: Record<string, string> = {
  processing: 'being processed',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: () => [...orderKeys.lists()] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
} as const

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: getOrders,
    select: (res) => res.data,
  })
}

export function useOrderById(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderById(id),
    enabled: Boolean(id),
    select: (res) => res.data,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PlaceOrderPayload) => placeOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      useNotificationStore.getState().addNotification('Your order has been placed successfully', 'order')
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
      useNotificationStore.getState().addNotification('Order cancelled', 'order')
    },
  })
}

export function useOrderStatusSync() {
  const { data: orders } = useOrders()
  const lastSeen = useNotificationStore((s) => s.lastSeenOrderStatuses)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const setLastSeen = useNotificationStore((s) => s.setLastSeenOrderStatuses)

  useEffect(() => {
    if (!orders) return
    const next: Record<string, string> = {}
    for (const order of orders) {
      next[order.id] = order.status
      const prev = lastSeen[order.id]
      if (prev && prev !== order.status) {
        const label = STATUS_LABELS[order.status] ?? order.status
        addNotification(`Order #${order.id.slice(-8).toUpperCase()} is now ${label}`, 'order')
      }
    }
    setLastSeen(next)
  }, [orders])
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
    },
  })
}
