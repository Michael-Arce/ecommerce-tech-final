import { useSearch } from '@tanstack/react-router'
import { Search, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProductCard } from '@/widgets/product-card'
import { useSemanticSearch, toProduct } from '@/entities/product'

export function SearchPage() {
  const { t } = useTranslation()
  const { q } = useSearch({ from: '/search' })
  const query = q?.trim() ?? ''

  const { data, isLoading } = useSemanticSearch({ q: query, perPage: 50 })

  const results = (data?.data?.products ?? []).map(toProduct)
  const ready   = !isLoading && query.length >= 2

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        {query ? (
          <>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted">
                {ready && results.length === 0
                  ? t('search.noResultsFor', 'No results for')
                  : ready
                    ? t('search.resultsFor', '{{count}} result(s) for', { count: results.length })
                    : t('search.searchingFor', 'Searching for')}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3" />
                AI
              </span>
            </div>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-text">
              "{query}"
            </h1>
          </>
        ) : (
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            {t('search.title', 'Search')}
          </h1>
        )}
      </div>

      {!query && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Search className="h-10 w-10 text-secondary/40" />
          <p className="text-sm text-muted">{t('search.placeholder', 'Type at least 2 characters to search.')}</p>
        </div>
      )}

      {ready && results.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Search className="h-10 w-10 text-secondary/40" />
          <p className="text-base font-semibold text-text">{t('search.noProducts', 'No products found')}</p>
          <p className="text-sm text-muted">{t('search.tryDifferent', 'Try different keywords or browse the catalog.')}</p>
        </div>
      )}

      {isLoading && query.length >= 2 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-surface/60" />
          ))}
        </div>
      )}

      {ready && results.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
