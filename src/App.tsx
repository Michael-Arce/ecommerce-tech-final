import { RouterProvider } from '@tanstack/react-router'
import { QueryProvider } from '@/app/providers/query-provider'
import { router } from '@/app/router'

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  )
}
