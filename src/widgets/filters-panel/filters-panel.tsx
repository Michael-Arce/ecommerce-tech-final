import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Input, Button } from '@/shared/ui'
import { useCatalogFilters } from '@/features/filter-catalog'
import { useBrands } from '@/entities/brand'

const CATEGORIES = [
  { label: 'Laptops',     slug: 'laptops' },
  { label: 'Smartphones', slug: 'smartphones' },
  { label: 'Headphones',  slug: 'headphones' },
  { label: 'Monitors',    slug: 'monitors' },
  { label: 'Tablets',     slug: 'tablets' },
  { label: 'Components',  slug: 'components' },
]

interface FiltersPanelProps {
  onClose?: () => void
}

export function FiltersPanel({ onClose }: FiltersPanelProps) {
  const { t } = useTranslation()
  const { filters, setFilter, clearFilters } = useCatalogFilters()
  const { data } = useBrands()
  const brands = data?.data ?? []
  const params = useParams({ strict: false }) as { categorySlug?: string }
  const activeCategory = params.categorySlug ?? filters.category

  const hasActiveFilters =
    !!activeCategory || !!filters.brand ||
    filters.minPrice !== undefined || filters.maxPrice !== undefined

  return (
    <aside className="flex flex-col gap-6">

      {/* Category */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{t('filters.category')}</h3>
        <ul className="flex flex-col gap-0.5">
          {CATEGORIES.map(({ label, slug }) => {
            const active = activeCategory === slug
            return (
              <li key={slug}>
                <button
                  onClick={() => { setFilter('category', active ? undefined : slug); onClose?.() }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active ? 'bg-primary text-white' : 'text-muted hover:bg-surface hover:text-text'
                  }`}
                >
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Brand */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{t('filters.brand')}</h3>
        <ul className="flex flex-col gap-0.5">
          {brands.map((brand) => {
            const active = filters.brand === brand.slug
            return (
              <li key={brand.id}>
                <button
                  onClick={() => { setFilter('brand', active ? undefined : brand.slug); onClose?.() }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active ? 'bg-primary text-white' : 'text-muted hover:bg-surface hover:text-text'
                  }`}
                >
                  {brand.logoUrl && (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className={`h-4 w-8 object-contain ${active ? 'brightness-0 invert' : ''}`}
                    />
                  )}
                  {brand.name}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{t('filters.price')}</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={t('filters.minPlaceholder')}
            min={0}
            value={filters.minPrice ?? ''}
            onChange={(e) => setFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full"
          />
          <span className="text-muted">–</span>
          <Input
            type="number"
            placeholder={t('filters.maxPlaceholder')}
            min={0}
            value={filters.maxPrice ?? ''}
            onChange={(e) => setFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          {t('filters.clearFilters')}
        </Button>
      )}
    </aside>
  )
}
