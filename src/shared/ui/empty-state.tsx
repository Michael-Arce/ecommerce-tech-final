import { cn } from '@/shared/lib/cn'

interface EmptyStateProps {
  message: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ message, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-3xl">
        🛍️
      </div>
      <div>
        <p className="text-lg font-semibold text-text">{message}</p>
        {description && <p className="mt-1 text-sm text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  )
}
