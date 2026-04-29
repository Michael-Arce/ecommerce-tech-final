import { useNavigate, useSearch, useLocation } from '@tanstack/react-router'
import type { ProductFilters } from '@/entities/product'

type SortBy = NonNullable<ProductFilters['sortBy']>

const VALID_SORT_VALUES: SortBy[] = ['price_asc', 'price_desc', 'newest']
const DEFAULT_SORT: SortBy = 'newest'

export function useCatalogSort() {
  const navigate = useNavigate()
  const location = useLocation()
  const raw = useSearch({ strict: false }) as { sortBy?: string }

  const sortBy: SortBy =
    raw.sortBy && (VALID_SORT_VALUES as string[]).includes(raw.sortBy)
      ? (raw.sortBy as SortBy)
      : DEFAULT_SORT

  function setSortBy(value: SortBy) {
    const raw_ = raw as Record<string, unknown>
    void navigate({ to: location.pathname, search: { ...raw_, sortBy: value } as never })
  }

  return { sortBy, setSortBy }
}
