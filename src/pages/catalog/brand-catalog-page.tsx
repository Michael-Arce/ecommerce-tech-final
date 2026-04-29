import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui'
import { ProductCard } from '@/widgets/product-card'
import { useBrandBySlug } from '@/entities/brand'
import { useProducts } from '@/entities/product'
import type { Brand } from '@/entities/brand'

// ─── Brand gradients ──────────────────────────────────────────────────────────
// Multi-color brands get their full palette. Single-color brands get a
// directional fade from the brand color to a darker shade for depth.

const BRAND_GRADIENTS: Record<string, string> = {
  apple:      'linear-gradient(135deg, #1a1a2e 0%, #000000 100%)',
  samsung:    'linear-gradient(135deg, #1428A0 0%, #060d3f 100%)',
  dell:       'linear-gradient(135deg, #007DB8 0%, #003d5c 100%)',
  sony:       'linear-gradient(135deg, #1f1f1f 0%, #000000 100%)',
  lg:         'linear-gradient(135deg, #A50034 0%, #4a0018 100%)',
  microsoft:  'linear-gradient(135deg, #F25022 0%, #7FBA00 33%, #00A4EF 66%, #FFB900 100%)',
  lenovo:     'linear-gradient(135deg, #E2231A 0%, #6b0f0b 100%)',
  bose:       'linear-gradient(135deg, #2d2d2d 0%, #111111 100%)',
  asus:       'linear-gradient(135deg, #00539B 0%, #001e3c 100%)',
  google:     'linear-gradient(135deg, #4285F4 0%, #EA4335 33%, #FBBC05 66%, #34A853 100%)',
  corsair:    'linear-gradient(135deg, #FFD000 0%, #7a5000 100%)',
  hp:         'linear-gradient(135deg, #0096D6 0%, #003a5c 100%)',
  acer:       'linear-gradient(135deg, #83B81A 0%, #2d4a00 100%)',
  nvidia:     'linear-gradient(135deg, #76B900 0%, #2a4500 100%)',
  amd:        'linear-gradient(135deg, #ED1C24 0%, #5c0a0d 100%)',
  intel:      'linear-gradient(135deg, #0071C5 0%, #002d5c 100%)',
  jabra:      'linear-gradient(135deg, #FFD000 0%, #b89600 100%)',
  benq:       'linear-gradient(135deg, #C8102E 0%, #4a0010 100%)',
  kingston:   'linear-gradient(135deg, #E2231A 0%, #6b0f0b 100%)',
  seagate:    'linear-gradient(135deg, #00A651 0%, #003d1e 100%)',
  sennheiser: 'linear-gradient(135deg, #1f1f1f 0%, #000000 100%)',
}

function getBrandGradient(brand: Brand): string {
  return BRAND_GRADIENTS[brand.slug] ?? `linear-gradient(135deg, ${brand.bgColor} 0%, #0a0a0a 100%)`
}

// Brands whose logos should be rendered white (brightness-0 invert).
// Includes all simpleicons brands + BenQ (Wikimedia SVG with transparent bg).
// Microsoft and Google are excluded — they have multicolor logos shown as-is.
const INVERT_LOGO_SLUGS = new Set([
  'apple', 'samsung', 'dell', 'sony', 'lg', 'lenovo', 'bose', 'asus',
  'corsair', 'hp', 'acer', 'nvidia', 'amd', 'intel', 'kingston', 'seagate',
  'sennheiser', 'benq',
])

// Inline heights (rem) — Tailwind can't detect dynamic class names in template literals.
const LOGO_HEIGHT: Record<string, string> = {
  benq: '2.5rem',  // wordmark — visually larger than icon-based logos
  bose: '5rem',    // icon-based — renders small at default size
}

function getLogoClassName(logoUrl: string, slug: string): string {
  const base = 'w-auto object-contain drop-shadow-lg'
  const shouldInvert = logoUrl.includes('simpleicons.org') || INVERT_LOGO_SLUGS.has(slug)
  return shouldInvert ? `${base} brightness-0 invert` : base
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BrandCatalogPage() {
  const { t, i18n } = useTranslation()
  const { brandSlug } = useParams({ from: '/brands/$brandSlug' })

  const { data: brandData, isLoading: brandLoading } = useBrandBySlug(brandSlug)
  const { data: productsData, isLoading: productsLoading } = useProducts({ brand: brandSlug, perPage: 50 })

  const brand    = brandData?.data
  const products = productsData?.data ?? []
  const isLoading = brandLoading || productsLoading

  if (brandLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-56 animate-pulse bg-surface/60" />
        <div className="mx-auto max-w-7xl w-full px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-surface/60" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-lg font-semibold text-text">{t('brands.brandNotFound')}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/brands">{t('brands.browseAllBrands')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <div
        className="relative flex min-h-56 items-center justify-center px-6 py-16"
        style={{ background: getBrandGradient(brand) }}
      >
        {/* dot texture */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* back link */}
        <Link
          to="/brands"
          className="absolute left-6 top-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {t('brands.allBrands')}
        </Link>

        {/* centered content */}
        <div className="relative flex flex-col items-center gap-3 text-center">
          {brand.logoUrl && (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              style={{ height: LOGO_HEIGHT[brand.slug] ?? '4rem' }}
              className={getLogoClassName(brand.logoUrl, brand.slug)}
            />
          )}
          <h1 className="text-4xl font-extrabold tracking-tight text-white">{brand.name}</h1>
          <p className="max-w-sm text-base text-white/60">{brand.tagline[i18n.language as 'en' | 'es'] ?? brand.tagline.en}</p>
          <div className="mt-1 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/80 ring-1 ring-white/15">
            <Package className="h-3.5 w-3.5" />
            {isLoading ? '...' : t('brands.productCount', { count: products.length })}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="bg-background py-10">
        <div className="mx-auto max-w-7xl px-6">
          {productsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-surface/60" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <Package className="h-10 w-10 text-secondary/40" />
              <p className="text-base font-semibold text-text">{t('brands.noProducts')}</p>
              <p className="text-sm text-muted">{t('brands.noProductsDesc', { name: brand.name })}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
