import { apiClient } from '@/shared/api/axios-instance'
import type { CartItem } from '../model/cart-store'

export interface ServerCartItem {
  id: string
  productId: string
  variantId: string | null
  name: string
  price: number
  imageUrl: string
  quantity: number
}

type ApiResponse<T> = { success: boolean; data: T }

export function toCartItem(s: ServerCartItem): CartItem {
  return {
    productId: s.productId,
    variantId: s.variantId ?? undefined,
    name:      s.name,
    price:     s.price,
    imageUrl:  s.imageUrl,
    quantity:  s.quantity,
  }
}

export const cartServerApi = {
  getCart: () =>
    apiClient.get<ApiResponse<ServerCartItem[]>>('/api/cart').then((r) => r.data.data),

  upsertItem: (item: CartItem) =>
    apiClient.put('/api/cart/items', item).then(() => undefined),

  removeItem: (productId: string, variantId?: string) =>
    apiClient.delete('/api/cart/items', { data: { productId, variantId } }).then(() => undefined),

  clearCart: () =>
    apiClient.delete('/api/cart').then(() => undefined),

  mergeCart: (items: CartItem[]) =>
    apiClient
      .post<ApiResponse<ServerCartItem[]>>('/api/cart/merge', { items })
      .then((r) => r.data.data),
}
