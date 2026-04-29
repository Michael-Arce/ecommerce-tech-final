import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'

describe('GET /api/products', () => {
  it('returns a paginated list of active products', async () => {
    const res = await request(app).get('/api/products')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.meta).toMatchObject({
      page: 1,
      perPage: 12,
    })
  })

  it('filters by category slug', async () => {
    const res = await request(app).get('/api/products?category=laptops')

    expect(res.status).toBe(200)
    const categoryIds = res.body.data.map((p: { categoryId: string }) => p.categoryId)
    expect(categoryIds.every((id: string) => id === 'cat1')).toBe(true)
  })

  it('filters by price range', async () => {
    const res = await request(app).get('/api/products?minPrice=500&maxPrice=1000')

    expect(res.status).toBe(200)
    const prices = res.body.data.map((p: { price: number }) => p.price)
    expect(prices.every((price: number) => price >= 500 && price <= 1000)).toBe(true)
  })

  it('filters by search query (name match)', async () => {
    const res = await request(app).get('/api/products?search=macbook')

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
    res.body.data.forEach((p: { name: string; description: string }) => {
      const match =
        p.name.toLowerCase().includes('macbook') ||
        p.description.toLowerCase().includes('macbook')
      expect(match).toBe(true)
    })
  })

  it('respects perPage pagination', async () => {
    const res = await request(app).get('/api/products?perPage=3')

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeLessThanOrEqual(3)
  })

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/api/products?sortBy=price_asc&perPage=50')

    expect(res.status).toBe(200)
    const prices: number[] = res.body.data.map((p: { price: number }) => p.price)
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]!).toBeGreaterThanOrEqual(prices[i - 1]!)
    }
  })
})

describe('GET /api/products/:slug', () => {
  it('returns the product for a valid slug', async () => {
    const res = await request(app).get('/api/products/macbook-pro-16-m3')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.slug).toBe('macbook-pro-16-m3')
    expect(res.body.data.name).toBe('MacBook Pro 16" M3')
  })

  it('returns 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/products/does-not-exist')

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
