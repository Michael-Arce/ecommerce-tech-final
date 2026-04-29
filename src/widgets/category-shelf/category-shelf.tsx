import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProductCard } from '@/widgets/product-card'
import { useInView } from '@/shared/hooks/use-in-view'
import { useProducts } from '@/entities/product'

interface PromoSlide {
  headline: string
  body: string
  gradient: string
}

interface CategoryShelfProps {
  slug: string
  label: string
  Icon: LucideIcon
  promo: { slides: readonly PromoSlide[] }
}

const CARD_WIDTH = 220
const SLIDE_DURATION = 4000
const TRANSITION_MS = 600

export function CategoryShelf({ slug, label, Icon, promo }: CategoryShelfProps) {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sectionRef, inView] = useInView()

  const [current, setCurrent]   = useState(0)
  const [next, setNext]         = useState<number | null>(null)
  const [sliding, setSliding]   = useState(false)
  const [hovering, setHovering] = useState(false)
  const slidingRef              = useRef(false)

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  const { data, isLoading } = useProducts({ category: slug, perPage: 8 })
  const products = data?.data ?? []

  const advance = useCallback(() => {
    if (slidingRef.current) return
    slidingRef.current = true
    const nextIdx = (current + 1) % promo.slides.length
    // Step 1: render next slide at translateX(100%) — no transition yet
    setNext(nextIdx)
    setSliding(false)
    // Step 2: after one paint, start the transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSliding(true)
        setTimeout(() => {
          setCurrent(nextIdx)
          setNext(null)
          setSliding(false)
          slidingRef.current = false
        }, TRANSITION_MS)
      })
    })
  }, [current, promo.slides.length])

  useEffect(() => {
    if (isMobile && inView) setHovering(true)
    else if (!isMobile) setHovering(false)
  }, [isMobile, inView])

  useEffect(() => {
    if (!hovering) return
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    function schedule() {
      t1 = setTimeout(() => {
        advance()
        t2 = setTimeout(schedule, TRANSITION_MS)
      }, SLIDE_DURATION)
    }
    schedule()
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [hovering, advance])

  useEffect(() => {
    if (!hovering) {
      setCurrent(0)
      setNext(null)
      setSliding(false)
    }
  }, [hovering])

  function scroll(direction: 'left' | 'right') {
    scrollRef.current?.scrollBy({
      left: direction === 'right' ? CARD_WIDTH * 2 : -CARD_WIDTH * 2,
      behavior: 'smooth',
    })
  }

  if (!isLoading && products.length === 0) return null

  const currentSlide = promo.slides[current]
  const nextSlide    = next !== null ? promo.slides[next] : null

  return (
    <section ref={sectionRef} className="bg-background border-b border-secondary/10">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className={`mb-6 flex items-center justify-between ${inView ? 'animate-slide-right' : 'opacity-0'}`}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text">{label}</h2>
          </div>
          <Link
            to="/catalog/$categorySlug"
            params={{ categorySlug: slug }}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t('categoryShelf.seeAll')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Link
          to="/catalog/$categorySlug"
          params={{ categorySlug: slug }}
          className={`mb-6 relative block h-36 md:h-40 overflow-hidden rounded-2xl cursor-pointer bg-slate-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 hover:ring-2 hover:ring-white/10 ${inView ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '100ms' }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="pointer-events-none absolute -right-16 -top-16 z-10 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-8 right-32 z-10 h-32 w-32 rounded-full bg-white/5" />

          {/* Current slide — slides out to left when transitioning */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${currentSlide.gradient} p-6 md:p-8`}
            style={{
              transition: sliding ? `transform ${TRANSITION_MS}ms ease-in-out` : 'none',
              transform: sliding ? 'translateX(-100%)' : 'translateX(0)',
            }}
          >
            <SlideContent label={label} slide={currentSlide} />
          </div>

          {/* Next slide — starts at right, slides in */}
          {nextSlide && (
            <div
              className={`absolute inset-0 bg-gradient-to-r ${nextSlide.gradient} p-6 md:p-8`}
              style={{
                transition: sliding ? `transform ${TRANSITION_MS}ms ease-in-out` : 'none',
                transform: sliding ? 'translateX(0)' : 'translateX(100%)',
              }}
            >
              <SlideContent label={label} slide={nextSlide} />
            </div>
          )}
        </Link>

        <div
          className={`relative ${inView ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '200ms' }}
        >
          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-52 shrink-0 rounded-xl bg-surface/60 animate-pulse" style={{ height: 280 }} />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll izquierda"
                className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md ring-1 ring-secondary/20 transition-all hover:bg-primary hover:text-white hover:shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none' }}
              >
                {products.map((product) => (
                  <div key={product.id} className="w-52 shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scroll('right')}
                aria-label="Scroll derecha"
                className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md ring-1 ring-secondary/20 transition-all hover:bg-primary hover:text-white hover:shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function SlideContent({ label, slide }: { label: string; slide: PromoSlide }) {
  const { t } = useTranslation()
  return (
    <div className="relative z-20 max-w-lg">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/50">
        {t('categoryShelf.featuredDeal')} · {label}
      </p>
      <h3 className="mt-1 text-xl font-extrabold leading-snug text-white md:text-2xl">
        {slide.headline}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-white/65">{slide.body}</p>
    </div>
  )
}
