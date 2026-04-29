import { Link } from '@tanstack/react-router'
export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-secondary">Page not found</p>
      <Link to="/" className="text-accent underline">Go home</Link>
    </div>
  )
}
