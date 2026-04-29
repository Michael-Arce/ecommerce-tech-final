import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Package, Tag, ShoppingBag, Users } from 'lucide-react'

const NAV_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
] as const

export function AdminSidebar() {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_LINKS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white [&.active]:bg-white/10 [&.active]:text-white"
          activeProps={{ className: 'active' }}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
