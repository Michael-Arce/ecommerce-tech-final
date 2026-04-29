import type { CartItem } from '../model/cart-store'

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate
}

export function calculateTotal(subtotal: number, tax: number, discount: number = 0): number {
  return subtotal + tax - discount
}
