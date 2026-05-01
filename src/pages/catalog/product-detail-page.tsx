import { useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import { formatCurrency } from '@/shared/lib/format-currency'
import { Button } from '@/shared/ui'
import { ProductGallery } from '@/widgets/product-gallery'
import { ProductCard } from '@/widgets/product-card'
import { AddToCartButton } from '@/features/add-to-cart'
import { WishlistToggleButton } from '@/features/add-to-wishlist'
import { useAuthStore } from '@/features/authenticate'
import { useCartStore } from '@/entities/cart'
import { useProductBySlug, useSimilarProducts, toProduct } from '@/entities/product'
import { useBrands } from '@/entities/brand'
import { AddiWidget } from '@/widgets/addi-widget';

// ─── Static maps ─────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, { label: string; slug: string }> = {
  cat1: { label: 'Laptops',      slug: 'laptops' },
  cat2: { label: 'Smartphones',  slug: 'smartphones' },
  cat3: { label: 'Headphones',   slug: 'headphones' },
  cat4: { label: 'Monitors',     slug: 'monitors' },
  cat5: { label: 'Tablets',      slug: 'tablets' },
  cat6: { label: 'Components',   slug: 'components' },
}

function getRating(productId: string): number {
  const n = productId.replace(/\D/g, '')
  return 3.8 + ((parseInt(n, 10) % 12) * 0.1)
}

function getRatingCount(productId: string): number {
  const n = parseInt(productId.replace(/\D/g, ''), 10)
  return 40 + ((n * 17) % 460)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={
            star <= Math.round(rating)
              ? 'h-4 w-4 fill-amber-400 text-amber-400'
              : 'h-4 w-4 fill-secondary/20 text-secondary/20'
          }
        />
      ))}
    </div>
  )
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
        Out of stock
      </span>
    )
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
        Only {stock} left
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
      In stock
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProductDetailPage() {
  const { productSlug } = useParams({ from: '/product/$productSlug' })
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const role = useAuthStore((s) => s.role)

  const { data: productData, isLoading, isError } = useProductBySlug(productSlug)
  const { data: brandsData } = useBrands()
  const product = productData?.data

  const category = product ? CATEGORY_MAP[product.categoryId] : undefined
  const brand = product
    ? brandsData?.data.find((b) => b.id === product.brandId)
    : undefined

  const { data: similarData } = useSimilarProducts(product?.id)
  const similar = (similarData?.data ?? []).map(toProduct)

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined)
  const selectedVariant = product?.variants.find(
    (v) => v.id === (selectedVariantId ?? product.variants[0]?.id),
  )
  const displayPrice    = selectedVariant?.price ?? product?.price ?? 0
  const discount = product?.compareAtPrice
    ? Math.round((1 - displayPrice / product.compareAtPrice) * 100)
    : null
  const rating      = product ? getRating(product.id) : 0
  const ratingCount = product ? getRatingCount(product.id) : 0

  function handleBuyNow() {
    if (!product) return
    addItem({
      productId: product.id,
      variantId: selectedVariantId ?? product.variants[0]?.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      imageUrl: product.images[0]?.url ?? '',
    })
    navigate({ to: '/checkout' })
  }

  function handleExpressAddiCheckout() {
    if (!product) return
    addItem({
      productId: product.id,
      variantId: selectedVariantId ?? product.variants[0]?.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      imageUrl: product.images[0]?.url ?? '',
    })
    navigate({ to: '/checkout' })
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-surface/60" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-surface/60" style={{ width: `${80 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Error / not found ────────────────────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <p className="text-lg font-semibold text-text">Product not found</p>
        <Link to="/catalog" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-secondary/10 bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-6 py-3 text-xs text-muted">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          {category && (
            <>
              <Link
                to="/catalog/$categorySlug"
                params={{ categorySlug: category.slug }}
                className="hover:text-primary transition-colors"
              >
                {category.label}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="truncate text-text font-medium">{product.name}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-2">

          {/* ── Gallery ── */}
          <ProductGallery
            images={product.images}
            name={product.name}
            activeVariantImageUrl={selectedVariant?.imageUrl}
          />

          {/* ── Info panel ── */}
          <div className="flex flex-col gap-5">

            {/* Brand + category */}
            <div className="flex items-center gap-2">
              {brand && (
                <Link
                  to="/brands/$brandSlug"
                  params={{ brandSlug: brand.slug }}
                  className="flex items-center gap-1.5 rounded-full border border-secondary/20 bg-surface px-3 py-1 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  {brand.logoUrl && (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-4 w-auto object-contain"
                    />
                  )}
                  <span className="text-xs font-semibold text-muted">{brand.name}</span>
                </Link>
              )}
              {category && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {category.label}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-text lg:text-3xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={rating} />
              <span className="text-sm font-semibold text-text">{rating.toFixed(1)}</span>
              <span className="text-sm text-muted">({ratingCount.toLocaleString()} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary">
                {formatCurrency(displayPrice)}
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-muted line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
              {discount && (
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white">
                  −{discount}%
                </span>
              )}
            </div>

            {/* Addi Widget */}
            <div className="mt-1 mb-2">
              <div 
                onClick={handleExpressAddiCheckout}
                className="block cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                role="button"
              >
                <AddiWidget price={displayPrice} />
              </div>
            </div>

            {/* Description */}
            <p className="leading-relaxed text-muted">{product.description}</p>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div>
                <p className="mb-2.5 text-sm font-semibold text-text">Options</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const activeId = selectedVariantId ?? product.variants[0]?.id
                    const isSelected = activeId === variant.id
                    const isOOS = variant.stock === 0
                    return (
                      <button
                        key={variant.id}
                        onClick={() => !isOOS && setSelectedVariantId(variant.id)}
                        disabled={isOOS}
                        className={[
                          'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                            : isOOS
                              ? 'cursor-not-allowed border-secondary/20 text-muted line-through opacity-40'
                              : 'border-secondary/25 bg-surface text-text hover:border-primary/40 hover:bg-primary/5',
                        ].join(' ')}
                      >
                        {variant.name}
                        {variant.price !== product.price && (
                          <span className={`ml-1.5 text-xs ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                            {formatCurrency(variant.price)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stock */}
            <StockBadge stock={selectedVariant?.stock ?? product.stock} />

            {/* CTA */}
            <div className="flex flex-col gap-2">
              {role !== 'admin' && product.stock > 0 && (
                <Button size="lg" className="w-full" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <AddToCartButton
                    product={product}
                    variantId={selectedVariantId ?? product.variants[0]?.id}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  />
                </div>
                <WishlistToggleButton productId={product.id} />
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-secondary/10 bg-surface p-4">
              {[
                { Icon: Truck,      title: 'Free Shipping', sub: 'Orders over $99' },
                { Icon: ShieldCheck, title: '2-Year Warranty', sub: 'All products' },
                { Icon: RefreshCw,  title: '30-Day Returns', sub: 'No questions' },
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-text">{title}</p>
                  <p className="text-[10px] text-muted">{sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  AI Recommendations
                </p>
                <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-text">
                  You May Also{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Like
                  </span>
                </h2>
              </div>
              {category && (
                <Link
                  to="/catalog/$categorySlug"
                  params={{ categorySlug: category.slug }}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  See all <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
