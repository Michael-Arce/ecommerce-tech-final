import { DollarSign, Package, TrendingDown, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { useOrders } from '@/entities/order'
import { useAdminProducts } from '@/entities/product'
import { useUsers } from '@/entities/user'

export function AdminStats() {
  const { data: ordersData }   = useOrders()
  const { data: productsData } = useAdminProducts()
  const { data: users = [] }   = useUsers()

  const orders   = ordersData ?? []
  const products = productsData?.data ?? []

  const totalSales    = orders.reduce((sum, o) => sum + o.total, 0)
  const criticalStock = products.filter((p) => p.stock < 5).length
  const totalProducts = products.length

  const STATS = [
    {
      label: 'Total Sales',
      value: formatCurrency(totalSales),
      sub: `${orders.length} orders`,
      Icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Critical Stock',
      value: criticalStock.toString(),
      sub: 'products below 5 units',
      Icon: TrendingDown,
      color: criticalStock > 0 ? 'text-destructive' : 'text-emerald-600',
      bg: criticalStock > 0 ? 'bg-destructive/10' : 'bg-emerald-500/10',
    },
    {
      label: 'Active Users',
      value: users.length.toString(),
      sub: 'registered accounts',
      Icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total Products',
      value: totalProducts.toString(),
      sub: 'in catalog',
      Icon: Package,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STATS.map(({ label, value, sub, Icon, color, bg }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary">{label}</CardTitle>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text">{value}</p>
            <p className="mt-1 text-xs text-secondary">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
