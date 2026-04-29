import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, MapPin, Package } from 'lucide-react'
import {
  Button,
  PageTitle,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Spinner,
} from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { formatDate } from '@/shared/lib/format-date'
import { useOrderById, useUpdateOrderStatus } from '@/entities/order'
import type { OrderStatus } from '@/entities/order'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',    label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
]

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending:    'bg-amber-500/10 text-amber-600',
  processing: 'bg-blue-500/10 text-blue-600',
  shipped:    'bg-indigo-500/10 text-indigo-600',
  delivered:  'bg-emerald-500/10 text-emerald-600',
  cancelled:  'bg-destructive/10 text-destructive',
}

export function AdminOrderDetailPage() {
  const { orderId } = useParams({ from: '/admin/orders/$orderId' })
  const navigate = useNavigate()
  const { data: order, isLoading } = useOrderById(orderId)
  const { mutateAsync, isPending, variables } = useUpdateOrderStatus()

  const pendingId = isPending ? (variables?.id ?? null) : null

  async function changeStatus(id: string, status: OrderStatus) {
    await mutateAsync({ id, status })
  }

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
        <p className="text-lg font-semibold text-text">Order not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/admin/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = order.total - subtotal
  const isPendingStatus = pendingId === order.id

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2"
          onClick={() => void navigate({ to: '/admin/orders' })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageTitle>Order detail</PageTitle>
          <p className="mt-0.5 font-mono text-xs text-secondary">{order.id}</p>
        </div>
        {/* Status selector */}
        <Select
          value={order.status}
          onValueChange={(val) => void changeStatus(order.id, val as OrderStatus)}
          disabled={isPendingStatus}
        >
          <SelectTrigger
            className={`h-8 w-40 text-xs font-semibold border-0 ${STATUS_CLASS[order.status]}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-secondary/20 bg-surface">
            <div className="border-b border-secondary/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-text">
                Items ({order.items.length})
              </h2>
            </div>
            <ul className="divide-y divide-secondary/10">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-14 w-14 shrink-0 rounded-lg bg-background object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-background">
                      <Package className="h-6 w-6 text-secondary/40" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{item.name}</p>
                    {item.variantId && (
                      <p className="text-xs text-secondary">Variant: {item.variantId}</p>
                    )}
                    <p className="text-xs text-secondary">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-text">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Order summary */}
          <div className="rounded-xl border border-secondary/20 bg-surface p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-secondary">Date</dt>
                <dd className="font-medium text-text">{formatDate(order.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Subtotal</dt>
                <dd className="font-medium text-text">{formatCurrency(subtotal)}</dd>
              </div>
              {shipping > 0 && (
                <div className="flex justify-between">
                  <dt className="text-secondary">Shipping</dt>
                  <dd className="font-medium text-text">{formatCurrency(shipping)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-secondary/10 pt-2">
                <dt className="font-semibold text-text">Total</dt>
                <dd className="font-bold text-primary">{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </div>

          {/* Shipping address */}
          <div className="rounded-xl border border-secondary/20 bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
              <MapPin className="h-4 w-4 text-secondary" />
              Shipping address
            </h2>
            <address className="not-italic text-sm text-secondary leading-relaxed">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </address>
          </div>
        </div>
      </div>
    </div>
  )
}
