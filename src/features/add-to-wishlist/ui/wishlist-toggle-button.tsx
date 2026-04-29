import { Heart } from 'lucide-react'
import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useWishlistStore } from '@/entities/wishlist'

interface WishlistToggleButtonProps {
  productId: string
}

export function WishlistToggleButton({ productId }: WishlistToggleButtonProps) {
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(productId))
  const addToWishlist = useWishlistStore((s) => s.addToWishlist)
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist)

  function handleToggle() {
    if (isInWishlist) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'shrink-0 border-rose-200 bg-white/80 text-rose-500 backdrop-blur-sm hover:border-rose-300 hover:bg-white hover:text-rose-600',
        isInWishlist && 'border-rose-400 bg-rose-50 text-rose-600',
      )}
    >
      <Heart
        className="h-5 w-5"
        fill={isInWishlist ? 'currentColor' : 'none'}
      />
    </Button>
  )
}
