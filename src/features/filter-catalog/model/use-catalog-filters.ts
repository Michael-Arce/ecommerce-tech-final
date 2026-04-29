import { useNavigate, useSearch, useLocation } from '@tanstack/react-router'

interface CatalogFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  page: number
}

type FilterKey = keyof CatalogFilters

export function useCatalogFilters() {
  const navigate = useNavigate()
  const location = useLocation()
  const raw = useSearch({ strict: false }) as Record<string, string | undefined>

  const filters: CatalogFilters = {
    category: raw.category,
    brand: raw.brand,
    minPrice: raw.minPrice ? Number(raw.minPrice) : undefined,
    maxPrice: raw.maxPrice ? Number(raw.maxPrice) : undefined,
    page: raw.page ? Number(raw.page) : 1,
  }

  function setFilter(key: FilterKey, value: string | number | undefined) {
    const next: Record<string, string | undefined> = { ...raw, page: '1' }
    if (value !== undefined && value !== '') {
      next[key] = String(value)
    } else {
      delete next[key]
    }
    void navigate({ to: location.pathname, search: next as never })
  }

  function clearFilters() {
    void navigate({ to: location.pathname, search: {} as never })
  }

  return { filters, setFilter, clearFilters }
}
