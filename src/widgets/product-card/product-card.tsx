import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Truck, CreditCard, Tag } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/format-currency'
import { WishlistToggleButton } from '@/features/add-to-wishlist'
import { useBrands } from '@/entities/brand'
import type { Product } from '@/entities/product'

interface ProductCardProps {
  product: Product
}

const FREE_SHIPPING_THRESHOLD = 99000

function getPromos(price: number, t: TFunction) {
  const promos: { icon: React.ReactNode; text: string; color: string }[] = []

  if (price >= FREE_SHIPPING_THRESHOLD) {
    promos.push({
      icon: <Truck className="h-3 w-3 shrink-0" />,
      text: t('productCard.freeShipping'),
      color: 'text-success',
    })
  }

  promos.push({
    icon: <CreditCard className="h-3 w-3 shrink-0" />,
    text: t('productCard.installments6', { amount: formatCurrency(price / 6) }),
    color: 'text-primary',
  })

  if (price >= 150000) {
    promos.push({
      icon: <CreditCard className="h-3 w-3 shrink-0" />,
      text: t('productCard.installments12', { amount: formatCurrency(price / 12) }),
      color: 'text-primary',
    })
  } else {
    promos.push({
      icon: <Tag className="h-3 w-3 shrink-0" />,
      text: t('productCard.subscribeDiscount'),
      color: 'text-accent',
    })
  }

  return promos.slice(0, 3)
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation()
  const { data } = useBrands()
  const brands = data?.data ?? []
  const image = product.images[0]
  const brandName = brands.find((b) => b.id === product.brandId)?.name ?? ''
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null
  const isLowStock = product.stock > 0 && product.stock <= 5
  const promos = getPromos(product.price, t)

  return (
    <Link
      to="/product/$productSlug"
      params={{ productSlug: product.slug }}
      className="group relative flex h-full flex-col rounded-xl bg-surface overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:ring-2 hover:ring-primary/30"
    >
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {discount && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}
        {isLowStock && (
          <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            {t('productCard.lowStock')}
          </span>
        )}
        {product.stock === 0 && (
          <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            {t('productCard.outOfStock')}
          </span>
        )}
      </div>

      {/* Wishlist */}
      <div className="absolute right-1.5 top-1.5 z-10" onClick={(e) => e.preventDefault()}>
        <WishlistToggleButton productId={product.id} />
      </div>

      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-background">
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
            <span className="text-4xl opacity-30">📦</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          {brandName && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{brandName}</p>
          )}
          <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-text transition-colors group-hover:text-primary">
            {product.name}
          </p>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          <ul className="flex flex-col gap-1">
            {promos.map((promo, i) => (
              <li key={i} className={`flex items-center gap-1.5 text-[11px] font-medium ${promo.color}`}>
                {promo.icon}
                <span className="truncate">{promo.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  )
}
