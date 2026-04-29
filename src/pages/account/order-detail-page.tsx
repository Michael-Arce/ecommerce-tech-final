import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, MapPin, Package, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, PageTitle, Spinner } from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { formatDate } from '@/shared/lib/format-date'
import { useOrderById, useCancelOrder } from '@/entities/order'
import type { OrderStatus } from '@/entities/order'

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending:    'bg-amber-500/10 text-amber-600',
  processing: 'bg-blue-500/10 text-blue-600',
  shipped:    'bg-indigo-500/10 text-indigo-600',
  delivered:  'bg-emerald-500/10 text-emerald-600',
  cancelled:  'bg-destructive/10 text-destructive',
}

const CANCELLABLE: OrderStatus[] = ['pending', 'processing']

export function OrderDetailPage() {
  const { t } = useTranslation()
  const { orderId } = useParams({ from: '/account/orders/$orderId' })
  const { data: order, isLoading } = useOrderById(orderId)
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold text-text">{t('account.orders.notFound')}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/account/orders">{t('account.orders.backToOrders')}</Link>
        </Button>
      </div>
    )
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const canCancel = CANCELLABLE.includes(order.status)

  function handleCancel() {
    cancelOrder(order!.id, {
      onSuccess: () => navigate({ to: '/account/orders' }),
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link to="/account/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageTitle>{t('account.orders.detailTitle')}</PageTitle>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[order.status]}`}>
            {t(`account.orderStatus.${order.status}`)}
          </span>
          <span className="text-sm text-secondary">{formatDate(order.createdAt, 'long')}</span>
        </div>

        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isCancelling}
            className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            {isCancelling ? t('account.orders.cancelling') : t('account.orders.cancelOrder')}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-secondary/20 bg-surface">
            <div className="flex items-center gap-2 border-b border-secondary/10 px-5 py-4">
              <Package className="h-4 w-4 text-secondary" />
              <h2 className="text-sm font-semibold text-text">{t('account.orders.items')}</h2>
            </div>
            <ul className="divide-y divide-secondary/10">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-background">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-secondary/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text">{item.name}</p>
                    <p className="text-xs text-secondary">
                      {t('account.orders.qty', { count: item.quantity, price: formatCurrency(item.price) })}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Summary + Address */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-secondary/20 bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">{t('orderSummary.title')}</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-secondary">
                <span>{t('orderSummary.subtotal')}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>{t('orderSummary.tax')}</span>
                <span>{formatCurrency(order.total - subtotal)}</span>
              </div>
              <div className="my-1 border-t border-secondary/10" />
              <div className="flex justify-between font-bold text-text">
                <span>{t('orderSummary.total')}</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-secondary/20 bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              <h2 className="text-sm font-semibold text-text">{t('account.orders.shippingAddress')}</h2>
            </div>
            <div className="text-sm leading-relaxed text-secondary">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
