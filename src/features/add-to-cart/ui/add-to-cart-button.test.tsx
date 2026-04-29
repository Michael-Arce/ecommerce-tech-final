import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddToCartButton } from './add-to-cart-button'
import type { Product } from '@/entities/product'

const { mockAddItem, mockCartStore } = vi.hoisted(() => {
  const mockAddItem = vi.fn()
  const mockCartStore = Object.assign(
    (selector: (s: { addItem: typeof mockAddItem }) => unknown) => selector({ addItem: mockAddItem }),
    { getState: vi.fn(() => ({ items: [] })) },
  )
  return { mockAddItem, mockCartStore }
})

let mockRole: string | null = 'customer'
let mockIsAuthenticated = true

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('@/entities/cart', () => ({
  useCartStore: mockCartStore,
  cartServerApi: { upsertItem: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock('@/features/authenticate', () => ({
  useAuthStore: (selector: (s: { role: string | null; isAuthenticated: boolean }) => unknown) =>
    selector({ role: mockRole, isAuthenticated: mockIsAuthenticated }),
}))

const baseProduct: Product = {
  id: 'p1',
  slug: 'macbook-pro',
  name: 'MacBook Pro 16"',
  description: 'Powerful laptop',
  price: 2499,
  images: [{ id: 'i1', url: 'https://example.com/img.jpg', altText: 'MacBook' }],
  variants: [],
  categoryId: 'cat1',
  brandId: 'brand1',
  stock: 10,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  mockAddItem.mockClear()
  mockRole = 'customer'
  mockIsAuthenticated = true
})

describe('AddToCartButton', () => {
  it('renders "Add to cart" for a customer with stock', () => {
    render(<AddToCartButton product={baseProduct} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
  })

  it('calls addItem with correct payload on click', () => {
    render(<AddToCartButton product={baseProduct} />)
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(mockAddItem).toHaveBeenCalledOnce()
    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'p1',
        name: 'MacBook Pro 16"',
        price: 2499,
        quantity: 1,
      }),
    )
  })

  it('shows "Added!" feedback immediately after clicking', () => {
    render(<AddToCartButton product={baseProduct} />)
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(screen.getByRole('button', { name: /added!/i })).toBeInTheDocument()
  })

  it('renders a disabled "Out of stock" button when stock is 0', () => {
    render(<AddToCartButton product={{ ...baseProduct, stock: 0 }} />)
    const btn = screen.getByRole('button', { name: /out of stock/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })

  it('renders nothing for admin users', () => {
    mockRole = 'admin'
    const { container } = render(<AddToCartButton product={baseProduct} />)
    expect(container).toBeEmptyDOMElement()
  })
})
