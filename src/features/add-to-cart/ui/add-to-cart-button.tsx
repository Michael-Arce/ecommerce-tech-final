import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui'
import { useCartStore, cartServerApi } from '@/entities/cart'
import { useAuthStore } from '@/features/authenticate'
import type { Product } from '@/entities/product'

interface AddToCartButtonProps {
  product: Product
  variantId?: string
  quantity?: number
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'secondary'
}

export function AddToCartButton({ product, variantId, quantity = 1, className, size, variant }: AddToCartButtonProps) {
  const { t } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)
  const role = useAuthStore((s) => s.role)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)

  if (role === 'admin') return null

  if (product.stock === 0) {
    return (
      <Button disabled variant="secondary" size={size}>
        {t('productCard.outOfStock')}
      </Button>
    )
  }

  function handleClick() {
    if (!isAuthenticated) {
      void navigate({ to: '/login' })
      return
    }

    const item = {
      productId: product.id,
      variantId,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.images[0]?.url ?? '',
    }
    addItem(item)
    if (isAuthenticated) {
      const updatedItem = useCartStore.getState().items.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId,
      )
      cartServerApi.upsertItem(updatedItem ?? item).catch((err) => console.error('[cart] upsertItem failed:', err))
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <Button onClick={handleClick} className={className} size={size} variant={variant}>
      {added ? t('productCard.added') : t('productCard.addToCart')}
    </Button>
  )
}
