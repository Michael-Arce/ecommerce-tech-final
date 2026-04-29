// ─── Domain types ─────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'admin'

export interface User {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role: UserRole
  createdAt: string
}

export interface Category {
  id: string
  slug: string
  name: string
}

export interface Brand {
  id: string
  slug: string
  name: string
  logoUrl?: string
  tagline: string
  productCount: number
  bgColor: string
}

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

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  productId: string
  variantId?: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export interface Address {
  id: string
  userId: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  isDefault: boolean
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  shippingAddress: Address
  createdAt: string
}

// ─── Express augmentation ────────────────────────────────────────────────────

export interface AuthPayload {
  userId: string
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload
    }
  }
}
