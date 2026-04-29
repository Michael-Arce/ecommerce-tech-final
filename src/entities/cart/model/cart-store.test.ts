import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cart-store'

const ITEM_A = {
  productId: 'p1',
  name: 'MacBook Pro',
  price: 2499,
  quantity: 1,
  imageUrl: 'https://example.com/img.jpg',
}

const ITEM_B = {
  productId: 'p2',
  name: 'iPhone 15 Pro',
  price: 999,
  quantity: 2,
  imageUrl: 'https://example.com/img2.jpg',
}

beforeEach(() => {
  useCartStore.getState().clearCart()
})

describe('cart store — addItem', () => {
  it('adds a new item to an empty cart', () => {
    useCartStore.getState().addItem(ITEM_A)
    const { items, cartCount, cartTotal } = useCartStore.getState()

    expect(items).toHaveLength(1)
    expect(items[0]?.productId).toBe('p1')
    expect(cartCount).toBe(1)
    expect(cartTotal).toBe(2499)
  })

  it('increments quantity when adding the same product', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem(ITEM_A)
    const { items, cartCount } = useCartStore.getState()

    expect(items).toHaveLength(1)
    expect(items[0]?.quantity).toBe(2)
    expect(cartCount).toBe(2)
  })

  it('treats same product with different variantId as separate items', () => {
    useCartStore.getState().addItem({ ...ITEM_A, variantId: 'v1a' })
    useCartStore.getState().addItem({ ...ITEM_A, variantId: 'v1b' })
    const { items } = useCartStore.getState()

    expect(items).toHaveLength(2)
  })

  it('computes cartTotal correctly with multiple items', () => {
    useCartStore.getState().addItem(ITEM_A) // 2499 × 1
    useCartStore.getState().addItem(ITEM_B) // 999 × 2
    const { cartTotal, cartCount } = useCartStore.getState()

    expect(cartTotal).toBe(2499 + 999 * 2)
    expect(cartCount).toBe(3)
  })
})

describe('cart store — removeItem', () => {
  it('removes an item by productId', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem(ITEM_B)
    useCartStore.getState().removeItem('p1')
    const { items } = useCartStore.getState()

    expect(items).toHaveLength(1)
    expect(items[0]?.productId).toBe('p2')
  })

  it('does nothing when removing a non-existent productId', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().removeItem('non-existent')
    expect(useCartStore.getState().items).toHaveLength(1)
  })
})

describe('cart store — updateQuantity', () => {
  it('updates the quantity of an item', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().updateQuantity('p1', 5)

    expect(useCartStore.getState().items[0]?.quantity).toBe(5)
    expect(useCartStore.getState().cartTotal).toBe(2499 * 5)
  })

  it('removes the item when quantity is set to 0', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().updateQuantity('p1', 0)

    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('cart store — clearCart', () => {
  it('empties all items and resets totals', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem(ITEM_B)
    useCartStore.getState().clearCart()

    const { items, cartTotal, cartCount } = useCartStore.getState()
    expect(items).toHaveLength(0)
    expect(cartTotal).toBe(0)
    expect(cartCount).toBe(0)
  })
})
