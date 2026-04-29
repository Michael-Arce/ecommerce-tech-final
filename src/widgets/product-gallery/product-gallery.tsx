import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui'
import type { ProductImage } from '@/entities/product'

interface ProductGalleryProps {
  images: ProductImage[]
  name?: string
  activeVariantImageUrl?: string | null
}

export function ProductGallery({ images, name = '', activeVariantImageUrl }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const active = images[activeIndex]
  const mainImageUrl = activeVariantImageUrl ?? active?.url
  const mainImageAlt = active?.altText ?? name

  if (!mainImageUrl && images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-background text-secondary/40">
        No images
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div
          className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-background"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={mainImageUrl}
            alt={mainImageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <ZoomIn className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200',
                  i === activeIndex
                    ? 'border-primary shadow-sm shadow-primary/20'
                    : 'border-transparent opacity-70 hover:border-secondary/40 hover:opacity-100',
                )}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={img.url}
                  alt={img.altText ?? `${name} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl border-0 bg-black/90 p-0 shadow-none">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex max-h-[85vh] items-center justify-center p-4">
            <img
              src={mainImageUrl}
              alt={mainImageAlt}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex justify-center gap-2 pb-4">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                    i === activeIndex ? 'border-white' : 'border-white/20 opacity-60 hover:opacity-100',
                  )}
                >
                  <img src={img.url} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
