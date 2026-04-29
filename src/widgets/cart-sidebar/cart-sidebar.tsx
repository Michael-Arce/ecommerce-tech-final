import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { useCartStore } from '@/entities/cart'

export function CartSidebar() {
  const items = useCartStore((s) => s.items)
  const cartTotal = useCartStore((s) => s.cartTotal)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-text">Your Cart</h2>

      {items.length === 0 ? (
        <p className="text-sm text-secondary">Your cart is empty.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variantId ?? ''}`} className="flex items-center gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-12 w-12 rounded-lg object-cover bg-background"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-text">{item.name}</p>
                  <p className="text-xs text-secondary">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-secondary/20 pt-3 flex justify-between text-sm font-semibold text-text">
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
        </>
      )}

      <Button asChild className="w-full">
        <Link to="/cart">View Cart</Link>
      </Button>
    </div>
  )
}
