import { Link } from '@tanstack/react-router'
import { ArrowRight, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBrands } from '@/entities/brand'
import type { Brand } from '@/entities/brand'

function getLogoClass(brand: Brand): string {
  const base = 'object-contain drop-shadow-lg'
  // Only invert simpleicons — they're transparent SVGs, safe to invert to white.
  // Other sources (Cloudinary JPEGs, worldvectorlogo, Wikipedia) have opaque
  // backgrounds or complex colors that break when inverted.
  return brand.logoUrl?.includes('simpleicons.org')
    ? `${base} brightness-0 invert`
    : base
}

function BrandCard({ brand }: { brand: Brand }) {
  const { t, i18n } = useTranslation()
  const tagline = brand.tagline[i18n.language as 'en' | 'es'] ?? brand.tagline.en
  const hasBanner = Boolean(brand.bannerUrl)

  return (
    <Link
      to="/brands/$brandSlug"
      params={{ brandSlug: brand.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      {/* ── Header ── */}
      <div className="relative h-44 overflow-hidden">
        {hasBanner ? (
          <>
            <img
              src={brand.bannerUrl!}
              alt={brand.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* scrim so logo + text always read */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          </>
        ) : (
          <div
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundColor: brand.bgColor }}
          />
        )}

        {/* Logo */}
        {brand.logoUrl ? (
          <div
            className={
              hasBanner
                ? 'absolute bottom-3 left-4 flex items-center'
                : 'absolute inset-0 flex items-center justify-center p-6'
            }
          >
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className={[
                hasBanner ? 'h-8 w-auto max-w-[7rem]' : 'h-12 w-auto max-w-[8rem]',
                getLogoClass(brand),
              ].join(' ')}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-extrabold text-white drop-shadow">
              {brand.name}
            </span>
          </div>
        )}

        {/* Product count pill — top right */}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm ring-1 ring-white/10">
            <Package className="h-3 w-3" />
            {brand.productCount === 0 ? t('brands.comingSoon') : brand.productCount}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-text">{brand.name}</h3>
            <p className="mt-0.5 text-sm leading-snug text-muted">{tagline}</p>
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      </div>
    </Link>
  )
}

export function BrandsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useBrands()
  const brands = data?.data ?? []

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {brands.length > 0 ? `${brands.length} ${t('brands.countSuffix')}` : `500+ ${t('brands.countSuffix')}`}
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-white md:text-5xl">{t('brands.title')}</h1>
          <p className="mt-3 max-w-xl text-lg text-white/60">{t('brands.subtitle')}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-background py-14">
        <div className="mx-auto max-w-7xl px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface/60" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
