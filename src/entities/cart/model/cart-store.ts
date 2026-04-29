import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  variantId?: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

interface CartState {
  items: CartItem[]
  cartTotal: number
  cartCount: number
  isSynced: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
}

function isSameItem(a: CartItem, b: { productId: string; variantId?: string }): boolean {
  return a.productId === b.productId && a.variantId === b.variantId
}

function computeTotals(items: CartItem[]) {
  return {
    cartTotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    cartCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      cartTotal: 0,
      cartCount: 0,
      isSynced: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => isSameItem(i, item))
          const items = existing
            ? state.items.map((i) =>
                isSameItem(i, item) ? { ...i, quantity: i.quantity + item.quantity } : i,
              )
            : [...state.items, item]
          return { items, ...computeTotals(items) }
        }),

      removeItem: (productId, variantId) =>
        set((state) => {
          const items = state.items.filter((i) => !isSameItem(i, { productId, variantId }))
          return { items, ...computeTotals(items) }
        }),

      updateQuantity: (productId, quantity, variantId) =>
        set((state) => {
          const items =
            quantity <= 0
              ? state.items.filter((i) => !isSameItem(i, { productId, variantId }))
              : state.items.map((i) =>
                  isSameItem(i, { productId, variantId }) ? { ...i, quantity } : i,
                )
          return { items, ...computeTotals(items) }
        }),

      clearCart: () => set({ items: [], cartTotal: 0, cartCount: 0, isSynced: false }),
    }),
    { name: 'ecommerce-cart' },
  ),
)
