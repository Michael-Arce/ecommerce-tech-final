import { useState } from 'react'
import { Outlet, Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useAuthStore } from '@/features/authenticate'
import { LogoutButton } from '@/features/logout'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet'

const NAV_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/brands', label: 'Brands' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
] as const

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="px-6 py-5">
        <Link to="/" className="text-lg font-bold text-white" onClick={onNavigate}>
          Premium<span className="text-accent">Tech</span>
          <span className="ml-1.5 text-xs font-normal text-white/40">Admin</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white [&.active]:bg-white/10 [&.active]:text-white"
            activeProps={{ className: 'active' }}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  )
}

export function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-secondary/20 bg-primary md:flex sticky top-0 h-screen overflow-y-auto">
        <SidebarNav />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-secondary/20 bg-surface px-4 py-3 md:px-6">
          {/* Hamburger — mobile only */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="rounded-md p-1.5 text-secondary hover:bg-secondary/10 md:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 bg-primary p-0 flex flex-col">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3 ml-auto">
            {user && (
              <span className="text-sm text-secondary">
                {user.firstName} {user.lastName}
              </span>
            )}
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
