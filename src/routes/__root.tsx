import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { ChatWidget } from '@/features/ai-assistant'
import { useAuthStore } from '@/features/authenticate'
import { useCartServerSync } from '@/entities/cart'
import { meQueryOptions } from './-meQueryOptions'

interface RouterContext {
  queryClient: QueryClient
}

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']
const PRIVATE_PREFIXES = ['/account', '/admin', '/checkout', ...AUTH_ROUTES]

function RootComponent() {
  useCartServerSync()
  const { pathname, pendingPathname, status } = useRouterState({
    select: (s) => ({
      pathname: s.resolvedLocation?.pathname ?? s.location.pathname,
      pendingPathname: s.location.pathname,
      status: s.status,
    }),
  })

  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))
  const isPendingAuthRoute = AUTH_ROUTES.some((p) => pendingPathname?.startsWith(p))
  const isPublicRoute = !PRIVATE_PREFIXES.some((p) => pathname.startsWith(p))

  if (status === 'pending' && isAuthRoute !== isPendingAuthRoute) {
    return <div className="min-h-screen bg-background" />
  }

  if (isAuthRoute) return <AuthLayout />

  if (isPublicRoute) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <ChatWidget />
      </div>
    )
  }

  return <Outlet />
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context: { queryClient } }) => {
    // Skip if already authenticated (e.g., after login/register in this session).
    if (useAuthStore.getState().isAuthenticated) return

    try {
      // ensureQueryData uses the cache (staleTime: Infinity) — only hits the network once.
      // The axios interceptor handles 401 → refresh → retry transparently.
      const result = await queryClient.ensureQueryData(meQueryOptions)
      if (result?.data) {
        useAuthStore.getState().setUser(result.data)
      }
    } catch {
      // User is not authenticated — public routes are fine, protected routes
      // redirect via their own beforeLoad guards.
    }
  },
  component: RootComponent,
})

export { meQueryOptions } from './-meQueryOptions'
