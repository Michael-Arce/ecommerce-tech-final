import { useCatalogFilters } from '@/features/filter-catalog'

interface PaginationControlsProps {
  totalPages: number
  currentPage: number
}

export function PaginationControls({ totalPages, currentPage }: PaginationControlsProps) {
  const { setFilter } = useCatalogFilters()

  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="mt-10 flex items-center justify-center gap-1">
      <button
        disabled={currentPage <= 1}
        onClick={() => setFilter('page', currentPage - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-secondary/20 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setFilter('page', p)}
          className={[
            'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
            p === currentPage
              ? 'bg-primary text-white shadow-sm shadow-primary/20'
              : 'border border-secondary/20 text-muted hover:border-primary/40 hover:text-primary',
          ].join(' ')}
        >
          {p}
        </button>
      ))}

      <button
        disabled={currentPage >= totalPages}
        onClick={() => setFilter('page', currentPage + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-secondary/20 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        ›
      </button>
    </div>
  )
}
