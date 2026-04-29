import type { Address } from '@/entities/address'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  productId: string
  variantId?: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  shippingAddress: Address
  createdAt: string
}
