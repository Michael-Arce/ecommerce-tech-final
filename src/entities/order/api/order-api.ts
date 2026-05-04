import { apiClient } from '@/shared/api/axios-instance'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Order, OrderStatus } from '../model/order.types'

export interface PlaceOrderPayload {
  items: Array<{
    productId: string
    variantId?: string
    name: string
    price: number
    quantity: number
    imageUrl: string
  }>
  deliveryMethod: 'shipping' | 'pickup'
  shippingAddress: {
    street: string
    city: string
    country: string
    cedula: string
    celular: string
  }
}

export function getOrders(): Promise<ApiResponse<Order[]>> {
  return apiClient.get<ApiResponse<Order[]>>('/api/orders').then((r) => r.data)
}

export function getOrderById(id: string): Promise<ApiResponse<Order>> {
  return apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`).then((r) => r.data)
}

export function placeOrder(payload: PlaceOrderPayload): Promise<ApiResponse<Order>> {
  return apiClient.post<ApiResponse<Order>>('/api/orders', payload).then((r) => r.data)
}

export function cancelOrder(id: string): Promise<ApiResponse<Order>> {
  return apiClient
    .patch<ApiResponse<Order>>(`/api/orders/${id}/cancel`)
    .then((r) => r.data)
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
  return apiClient
    .patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status })
    .then((r) => r.data)
}
