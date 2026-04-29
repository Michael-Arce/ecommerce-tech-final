export interface ProductImage {
  id: string
  url: string
  altText?: string
}

export interface ProductVariant {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  imageUrl?: string | null
  attributes: Record<string, string>
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  images: ProductImage[]
  variants: ProductVariant[]
  categoryId: string
  brandId: string
  stock: number
  isActive: boolean
  createdAt: string
}

export interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  page?: number
  perPage?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest'
}

export interface SearchProduct {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice: number | null
  stock: number
  image: string | null
  brandId: string
  brand: { name: string; slug: string }
  category: { name: string; slug: string }
  _score?: number
  _similarity?: number
}

export interface SearchParams {
  q?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStock?: 'true' | 'false'
  page?: number
  perPage?: number
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
}

export interface SearchResponse {
  products: SearchProduct[]
  page: number
  perPage: number
  total?: number
  totalPages?: number
  hasMore?: boolean
}

export function toProduct(p: SearchProduct): Product {
  return {
    id:             p.id,
    slug:           p.slug,
    name:           p.name,
    description:    p.description,
    price:          p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    stock:          p.stock,
    isActive:       true,
    createdAt:      '',
    categoryId:     '',
    brandId:        p.brandId,
    images:         p.image ? [{ id: p.id, url: p.image, altText: p.name }] : [],
    variants:       [],
  }
}
