import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, Button } from '@/shared/ui'
import { FiltersPanel } from '@/widgets/filters-panel'
import { ProductCard } from '@/widgets/product-card'
import { PaginationControls } from '@/widgets/pagination'
import { useCatalogSort } from '@/features/sort-catalog'
import { useCatalogFilters } from '@/features/filter-catalog'
import { useProducts } from '@/entities/product'

const PER_PAGE = 12

const SORT_VALUES = [
  { value: 'newest',     key: 'catalog.sortNewest' },
  { value: 'price_asc',  key: 'catalog.sortPriceAsc' },
  { value: 'price_desc', key: 'catalog.sortPriceDesc' },
] as const

export function CatalogPage() {
  const { t } = useTranslation()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { sortBy, setSortBy } = useCatalogSort()
  const { filters, clearFilters } = useCatalogFilters()
  const params = useParams({ strict: false }) as { categorySlug?: string }

  // Path param takes precedence over search param (e.g. /catalog/laptops)
  const activeCategory = params.categorySlug ?? filters.category

  const { data, isLoading, isError } = useProducts({
    category: activeCategory,
    brand: filters.brand,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    page: filters.page,
    perPage: PER_PAGE,
    sortBy,
  })

  const products   = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1
  const total      = data?.meta.total ?? 0
  const currentPage = filters.page

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">{t('filters.title')}</h1>

      <div className="flex gap-8">
        {/* Filters sidebar — desktop only */}
        <aside className="hidden w-56 shrink-0 md:block">
          <FiltersPanel />
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Sort bar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile filters button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t('filters.title')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle>{t('filters.title')}</SheetTitle>
                  </SheetHeader>
                  <FiltersPanel onClose={() => setMobileFiltersOpen(false)} />
                </SheetContent>
              </Sheet>
              <p className="text-sm text-muted">
                {isLoading ? '...' : t('catalog.productsFound', { count: total })}
              </p>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-48 bg-surface">
                <SelectValue placeholder={t('catalog.sortBy')} />
              </SelectTrigger>
              <SelectContent className="z-50">
                {SORT_VALUES.map(({ value, key }) => (
                  <SelectItem key={value} value={value}>
                    {t(key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center gap-2 py-24 text-center">
              <p className="text-lg font-semibold text-text">{t('catalog.failedToLoad')}</p>
              <p className="text-sm text-muted">{t('catalog.tryAgain')}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <div key={i} className="rounded-xl bg-surface/60 animate-pulse" style={{ height: 280 }} />
              ))}
            </div>
          )}

          {/* No results */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-lg font-semibold text-text">{t('catalog.noProducts')}</p>
              <p className="text-sm text-muted">{t('catalog.adjustFilters')}</p>
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t('catalog.clearAllFilters')}
              </button>
            </div>
          )}

          {/* Product grid */}
          {!isLoading && !isError && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <PaginationControls totalPages={totalPages} currentPage={currentPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
