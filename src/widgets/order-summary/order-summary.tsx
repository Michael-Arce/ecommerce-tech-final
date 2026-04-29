import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/lib/format-currency'
import { calculateSubtotal, calculateTax, calculateTotal } from '@/entities/cart'
import type { CartItem } from '@/entities/cart'

interface OrderSummaryProps {
  items: CartItem[]
}

const TAX_RATE = 0.1

export function OrderSummary({ items }: OrderSummaryProps) {
  const { t } = useTranslation()
  const subtotal = calculateSubtotal(items)
  const tax = calculateTax(subtotal, TAX_RATE)
  const total = calculateTotal(subtotal, tax)

  return (
    <div className="rounded-xl border border-secondary/20 bg-surface p-6">
      <h2 className="mb-4 text-lg font-semibold text-text">{t('orderSummary.title')}</h2>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-secondary">
          <span>{t('orderSummary.subtotal')}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-secondary">
          <span>{t('orderSummary.tax')}</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="my-2 border-t border-secondary/20" />
        <div className="flex justify-between text-base font-bold text-text">
          <span>{t('orderSummary.total')}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
