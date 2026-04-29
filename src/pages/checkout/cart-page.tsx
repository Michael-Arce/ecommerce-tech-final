import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, PageTitle } from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { OrderSummary } from '@/widgets/order-summary'
import { useCartStore, cartServerApi } from '@/entities/cart'
import { useAuthStore } from '@/features/authenticate'
import { Minus, Plus, Trash2 } from 'lucide-react'

export function CartPage() {
  const { t } = useTranslation()
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  function handleRemove(productId: string, variantId?: string) {
    removeItem(productId, variantId)
    if (isAuthenticated) void cartServerApi.removeItem(productId, variantId)
  }

  function handleUpdateQuantity(productId: string, quantity: number, variantId?: string) {
    if (quantity <= 0) {
      handleRemove(productId, variantId)
      return
    }
    updateQuantity(productId, quantity, variantId)
    if (isAuthenticated) {
      const item = useCartStore.getState().items.find(
        (i) => i.productId === productId && i.variantId === variantId,
      )
      if (item) void cartServerApi.upsertItem({ ...item, quantity })
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <EmptyState
          message={t('cart.empty')}
          description={t('cart.emptyDesc')}
          action={
            <Button asChild>
              <Link to="/catalog">{t('cart.browseProducts')}</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageTitle className="mb-8">{t('cart.title')}</PageTitle>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="flex flex-col divide-y divide-secondary/10">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variantId ?? ''}`} className="flex gap-4 py-5">
                <img
                  src={item.imageUrl || 'https://placehold.co/80x80/F9FAFB/6B7280?text=...'}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg object-cover bg-background shrink-0"
                />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-text">{item.name}</p>
                    <button
                      onClick={() => handleRemove(item.productId, item.variantId)}
                      className="text-secondary hover:text-destructive transition-colors"
                      aria-label={t('cart.removeItem')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity selector */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-4">
          <OrderSummary items={items} />
          <Button asChild size="lg" className="w-full">
            <Link to="/checkout">{t('cart.proceedToCheckout')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
