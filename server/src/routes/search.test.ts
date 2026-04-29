import { describe, it, expect, beforeAll, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { prisma } from '../lib/prisma.js'

// Cohere is mocked so semantic search tests don't consume API credits
vi.mock('../lib/embeddings.js', () => ({
  embedQuery: vi.fn().mockResolvedValue(new Array(1024).fill(0.1)),
}))

// ── Filter-only search (no q) ──────────────────────────────────────────────────

describe('GET /api/search — filter only', () => {
  it('returns paginated products', async () => {
    const res = await request(app).get('/api/search?perPage=5')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.products.length).toBeGreaterThan(0)
    expect(res.body.data.total).toBeGreaterThan(0)
    expect(res.body.data.totalPages).toBeGreaterThan(0)
  })

  it('filters by category', async () => {
    const res = await request(app).get('/api/search?category=laptops&perPage=20')

    expect(res.status).toBe(200)
    expect(res.body.data.products.length).toBeGreaterThan(0)
    expect(
      res.body.data.products.every((p: { category: { slug: string } }) => p.category.slug === 'laptops')
    ).toBe(true)
  })

  it('filters by price range', async () => {
    const res = await request(app).get('/api/search?minPrice=100&maxPrice=500&perPage=20')

    expect(res.status).toBe(200)
    expect(
      res.body.data.products.every((p: { price: number }) => p.price >= 100 && p.price <= 500)
    ).toBe(true)
  })

  it('filters inStock=true products', async () => {
    const res = await request(app).get('/api/search?inStock=true&perPage=20')

    expect(res.status).toBe(200)
    expect(
      res.body.data.products.every((p: { stock: number }) => p.stock > 0)
    ).toBe(true)
  })

  it('returns 400 for query exceeding max length', async () => {
    const res = await request(app).get(`/api/search?q=${'a'.repeat(201)}`)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 for invalid sort value', async () => {
    const res = await request(app).get('/api/search?sort=invalid')

    expect(res.status).toBe(400)
  })
})

// ── Semantic search (Cohere mocked) ───────────────────────────────────────────

describe('GET /api/search — semantic (mocked embeddings)', () => {
  it('returns products with _score for a query', async () => {
    const res = await request(app).get('/api/search?q=laptop&perPage=5')

    expect(res.status).toBe(200)
    expect(res.body.data.products.length).toBeGreaterThan(0)
    expect(res.body.data.products[0]._score).toBeDefined()
    expect(typeof res.body.data.hasMore).toBe('boolean')
    expect(res.body.data.total).toBeUndefined()
  })

  it('applies category filter to semantic results', async () => {
    const res = await request(app).get('/api/search?q=laptop&category=laptops&perPage=10')

    expect(res.status).toBe(200)
    expect(
      res.body.data.products.every((p: { category: { slug: string } }) => p.category.slug === 'laptops')
    ).toBe(true)
  })

  it('respects perPage limit', async () => {
    const res = await request(app).get('/api/search?q=phone&perPage=3')

    expect(res.status).toBe(200)
    expect(res.body.data.products.length).toBeLessThanOrEqual(3)
  })

  it('includes brandId in each product for UI compatibility', async () => {
    const res = await request(app).get('/api/search?q=phone&perPage=3')

    expect(res.status).toBe(200)
    expect(
      res.body.data.products.every((p: { brandId: string }) => typeof p.brandId === 'string')
    ).toBe(true)
  })

  it('responds within 2 seconds (DB query only, Cohere mocked)', async () => {
    const start = Date.now()
    await request(app).get('/api/search?q=gaming+laptop&perPage=10')
    expect(Date.now() - start).toBeLessThan(2000)
  })
})

// ── Similar products ───────────────────────────────────────────────────────────

describe('GET /api/products/:id/similar', () => {
  let productId: string

  beforeAll(async () => {
    const product = await prisma.product.findFirst({
      where: { isActive: true, embeddingVersion: { gt: 0 } },
    })
    productId = product!.id
  })

  it('returns up to 6 similar products', async () => {
    const res = await request(app).get(`/api/products/${productId}/similar`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data.length).toBeLessThanOrEqual(6)
  })

  it('excludes the source product from results', async () => {
    const res = await request(app).get(`/api/products/${productId}/similar`)

    expect(res.body.data.every((p: { id: string }) => p.id !== productId)).toBe(true)
  })

  it('includes _similarity score in each result', async () => {
    const res = await request(app).get(`/api/products/${productId}/similar`)

    expect(res.body.data.every((p: { _similarity: number }) => p._similarity > 0)).toBe(true)
  })

  it('limits to max 2 products per brand', async () => {
    const res = await request(app).get(`/api/products/${productId}/similar?limit=20`)

    const brandCounts: Record<string, number> = {}
    for (const p of res.body.data as { brand: { slug: string } }[]) {
      brandCounts[p.brand.slug] = (brandCounts[p.brand.slug] ?? 0) + 1
    }
    expect(Object.values(brandCounts).every((n) => n <= 2)).toBe(true)
  })

  it('returns 404 for unknown product id', async () => {
    const res = await request(app).get('/api/products/nonexistent-id-xyz/similar')

    expect(res.status).toBe(404)
  })
})

// ── Relevance smoke tests (stored embeddings, no Cohere call) ─────────────────

describe('Relevance — stored embeddings', () => {
  it('iPhone similar products include other smartphones', async () => {
    const iphone = await prisma.product.findFirst({ where: { slug: 'iphone-15-pro' } })
    if (!iphone) return

    const res = await request(app).get(`/api/products/${iphone.id}/similar?limit=6`)

    expect(res.status).toBe(200)
    const categories = res.body.data.map((p: { category: { slug: string } }) => p.category.slug)
    expect(categories.some((c: string) => c === 'smartphones')).toBe(true)
  })

  it('gaming laptop similar products include laptops or monitors', async () => {
    const laptop = await prisma.product.findFirst({ where: { slug: 'asus-rog-zephyrus-g14' } })
    if (!laptop) return

    const res = await request(app).get(`/api/products/${laptop.id}/similar?limit=6`)

    expect(res.status).toBe(200)
    const categories = res.body.data.map((p: { category: { slug: string } }) => p.category.slug)
    expect(
      categories.some((c: string) => ['laptops', 'monitors', 'components'].includes(c))
    ).toBe(true)
  })
})
