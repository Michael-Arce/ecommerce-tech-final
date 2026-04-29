import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, PageTitle, Spinner } from '@/shared/ui'
import { ProductCard } from '@/widgets/product-card'
import { useWishlistStore } from '@/entities/wishlist'
import { useProducts } from '@/entities/product'

export function WishlistPage() {
  const { t } = useTranslation()
  const productIds = useWishlistStore((s) => s.productIds)
  const clearWishlist = useWishlistStore((s) => s.clearWishlist)

  const { data: productsRes, isLoading } = useProducts({ perPage: 100 })
  const products = (productsRes?.data ?? []).filter((p) => productIds.includes(p.id))

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageTitle>
          {t('account.wishlist.title')}
          {products.length > 0 && (
            <span className="ml-2 text-base font-normal text-secondary">({products.length})</span>
          )}
        </PageTitle>
        {products.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearWishlist}
            className="text-destructive hover:text-destructive"
          >
            {t('account.wishlist.clearAll')}
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          message={t('account.wishlist.empty')}
          description={t('account.wishlist.emptyDesc')}
          action={
            <Button asChild>
              <Link to="/catalog">
                <Heart className="mr-1.5 h-4 w-4" />
                {t('account.wishlist.explore')}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
