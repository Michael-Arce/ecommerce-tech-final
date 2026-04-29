import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/features/authenticate'
import { useCartStore } from './cart-store'
import { cartServerApi, toCartItem } from '../api/cart-server-api'

function computeTotals(items: ReturnType<typeof toCartItem>[]) {
  return {
    cartTotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    cartCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

export function useCartServerSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      initialized.current = false
      return
    }
    if (initialized.current) return
    initialized.current = true

    const { items: localItems, isSynced } = useCartStore.getState()

    async function init() {
      try {
        const serverItems = localItems.length > 0 && !isSynced
          ? await cartServerApi.mergeCart(localItems)
          : await cartServerApi.getCart()

        const items = serverItems.map(toCartItem)
        useCartStore.setState({ items, isSynced: true, ...computeTotals(items) })
      } catch (err) {
        console.error('[cart] sync failed:', err)
      }
    }

    void init()
  }, [isAuthenticated])
}
