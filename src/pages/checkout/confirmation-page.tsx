import { Link } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/shared/ui'

export function ConfirmationPage() {
  const { t } = useTranslation()
  const { orderId } = useParams({ from: '/checkout/confirmation/$orderId' })

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-text">{t('confirmation.title')}</h1>
      <p className="mt-3 text-muted">
        {t('confirmation.subtitle')}
      </p>

      <div className="mt-6 inline-block rounded-xl border border-secondary/20 bg-surface px-6 py-4">
        <p className="text-xs font-medium text-secondary">{t('confirmation.orderId')}</p>
        <p className="mt-1 font-mono text-sm font-semibold text-text">{orderId}</p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link to="/account/orders">
            <Package className="mr-2 h-4 w-4" />
            {t('confirmation.viewOrders')}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/catalog">
            <ShoppingBag className="mr-2 h-4 w-4" />
            {t('confirmation.continueShopping')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
