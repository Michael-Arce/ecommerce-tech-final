import { cn } from '@/shared/lib/cn'

interface PageTitleProps {
  children: React.ReactNode
  className?: string
}

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 className={cn('text-2xl font-bold text-text', className)}>
      {children}
    </h1>
  )
}
