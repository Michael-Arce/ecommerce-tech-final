import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { PageTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { formatDate } from '@/shared/lib/format-date'
import { AdminStats } from '@/widgets/admin-stats'
import { useOrders } from '@/entities/order'
import { useAuth } from '@/shared/hooks/use-auth'
import type { OrderStatus } from '@/entities/order'

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending:    'bg-amber-500/10 text-amber-600',
  processing: 'bg-blue-500/10 text-blue-600',
  shipped:    'bg-indigo-500/10 text-indigo-600',
  delivered:  'bg-emerald-500/10 text-emerald-600',
  cancelled:  'bg-destructive/10 text-destructive',
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: ordersData, isLoading } = useOrders()
  const recentOrders = (ordersData ?? []).slice(0, 5)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <PageTitle>Dashboard</PageTitle>
        {user && <p className="mt-1 text-sm text-secondary">Welcome back, {user.firstName}.</p>}
      </div>

      <AdminStats />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-secondary/20 bg-surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Ship to</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 animate-pulse rounded bg-surface/60" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-secondary">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-background/50">
                    <TableCell className="font-mono text-xs text-secondary">{order.id}</TableCell>
                    <TableCell className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state}</TableCell>
                    <TableCell className="text-sm text-secondary">{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_CLASS[order.status]}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(order.total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
