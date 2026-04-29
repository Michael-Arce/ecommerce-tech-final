import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

const PRODUCT_INCLUDE = {
  images:   { orderBy: { order: 'asc' as const } },
  variants: true,
  category: true,
  brand:    true,
}

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { category, brand, minPrice, maxPrice, search, sortBy, page = '1', perPage = '12' } =
      req.query as Record<string, string>

    const where: any = { isActive: true }

    if (category) where.category = { slug: category }
    if (brand)    where.brand    = { slug: brand }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const orderBy: any =
      sortBy === 'price_asc'  ? { price: 'asc' }  :
      sortBy === 'price_desc' ? { price: 'desc' } :
      sortBy === 'newest'     ? { createdAt: 'desc' } :
      { createdAt: 'desc' }

    const perPageN = Math.min(Number(perPage), 100)
    const pageN    = Number(page)

    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip:    (pageN - 1) * perPageN,
        take:    perPageN,
        include: PRODUCT_INCLUDE,
      }),
    ])

    res.json({
      success: true,
      data,
      meta: { total, page: pageN, perPage: perPageN, totalPages: Math.ceil(total / perPageN) },
    })
  } catch (err) { next(err) }
})

// ── GET /api/products/:id/similar ─────────────────────────────────────────────
type SimilarRow = {
  id: string; slug: string; name: string
  price: unknown; compare_at_price: unknown; stock: unknown
  brand_id: string; brand_name: string; brand_slug: string
  category_name: string; category_slug: string
  image_url: string | null; similarity: unknown
}

router.get('/:id/similar', async (req, res, next) => {
  try {
    const { id } = req.params
    const limit = Math.min(Number(req.query.limit ?? 6), 20)

    const product = await prisma.product.findUnique({
      where:  { id },
      select: { id: true, categoryId: true, embeddingVersion: true },
    })
    if (!product) return void res.status(404).json({ success: false, message: 'Product not found' })

    // Fallback: producto sin embedding → top por stock en la misma categoría
    if (product.embeddingVersion === 0) {
      const fallback = await prisma.product.findMany({
        where:   { isActive: true, id: { not: id }, categoryId: product.categoryId },
        orderBy: { stock: 'desc' },
        take:    limit,
        include: { images: { orderBy: { order: 'asc' as const }, take: 1 }, brand: true, category: true },
      })
      return void res.json({
        success: true,
        data: fallback.map(p => ({
          id: p.id, slug: p.slug, name: p.name,
          price: p.price, compareAtPrice: p.compareAtPrice, stock: p.stock,
          image: p.images[0]?.url ?? null,
          brand: { name: p.brand.name, slug: p.brand.slug },
          category: { name: p.category.name, slug: p.category.slug },
        })),
        fallback: true,
      })
    }

    // Vector similarity — embedding stays in DB, no round-trip to Node
    const candidates = await prisma.$queryRaw<SimilarRow[]>(Prisma.sql`
      SELECT
        p.id, p.slug, p.name,
        p.price, p."compareAtPrice"  AS compare_at_price, p.stock,
        p."brandId"                  AS brand_id,
        b.name AS brand_name,        b.slug AS brand_slug,
        c.name AS category_name,     c.slug AS category_slug,
        (SELECT url FROM "ProductImage" WHERE "productId" = p.id ORDER BY "order" LIMIT 1) AS image_url,
        1 - (p.embedding <=> (SELECT embedding FROM "Product" WHERE id = ${id})) AS similarity
      FROM       "Product"  p
      JOIN       "Brand"    b ON b.id = p."brandId"
      JOIN       "Category" c ON c.id = p."categoryId"
      WHERE p."isActive" = true
        AND p.id        != ${id}
        AND p.embedding IS NOT NULL
      ORDER BY p.embedding <=> (SELECT embedding FROM "Product" WHERE id = ${id})
      LIMIT ${limit * 3}
    `)

    // Brand diversification: max 2 results per brand
    const brandCount = new Map<string, number>()
    const results: SimilarRow[] = []
    for (const row of candidates) {
      const n = brandCount.get(row.brand_id) ?? 0
      if (n >= 2) continue
      brandCount.set(row.brand_id, n + 1)
      results.push(row)
      if (results.length >= limit) break
    }

    res.json({
      success: true,
      data: results.map(r => ({
        id:             r.id,
        slug:           r.slug,
        name:           r.name,
        price:          Number(r.price),
        compareAtPrice: r.compare_at_price != null ? Number(r.compare_at_price) : null,
        stock:          Number(r.stock),
        image:          r.image_url,
        brandId:        r.brand_id,
        brand:          { name: r.brand_name, slug: r.brand_slug },
        category:       { name: r.category_name, slug: r.category_slug },
        _similarity:    Number(r.similarity),
      })),
    })
  } catch (err) { next(err) }
})

// ── GET /api/products/admin/all — admin: all products incl. inactive ──────────
router.get('/admin/all', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const data = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: PRODUCT_INCLUDE,
    })
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── GET /api/products/:slug ───────────────────────────────────────────────────
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where:   { slug: req.params.slug },
      include: PRODUCT_INCLUDE,
    })
    if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return }
    res.json({ success: true, data: product })
  } catch (err) { next(err) }
})

// ── POST /api/products — admin ────────────────────────────────────────────────
const variantInputSchema = z.object({
  sku:      z.string().min(1),
  name:     z.string().min(1),
  price:    z.number().positive(),
  stock:    z.number().int().min(0),
  imageUrl: z.string().url().optional().nullable(),
  attributes: z.record(z.string()).optional(),
})

const createProductSchema = z.object({
  name:           z.string().min(2),
  description:    z.string().min(1),
  price:          z.number().positive(),
  compareAtPrice: z.number().nonnegative().optional(),
  stock:          z.number().int().min(0),
  categoryId:     z.string().min(1),
  brandId:        z.string().optional(),
  imageUrl:       z.string().url().optional(),
  imageUrls:      z.array(z.string().url()).optional(),
  isActive:       z.boolean().optional(),
  variants:       z.array(variantInputSchema).optional(),
})

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = createProductSchema.parse(req.body)
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const existing = await prisma.product.findUnique({ where: { slug: baseSlug } })
    const slug     = existing ? `${baseSlug}-${Date.now()}` : baseSlug

    const product = await prisma.product.create({
      data: {
        slug,
        name:           data.name,
        description:    data.description,
        price:          data.price,
        compareAtPrice: data.compareAtPrice,
        stock:          data.stock,
        categoryId:     data.categoryId,
        brandId:        data.brandId ?? 'brand1',
        isActive:       data.isActive ?? true,
        images: (() => {
          const urls = data.imageUrls?.length
            ? data.imageUrls
            : data.imageUrl ? [data.imageUrl] : []
          return urls.length
            ? { create: urls.map((url, order) => ({ url, order })) }
            : undefined
        })(),
        variants: data.variants?.length
          ? {
              create: data.variants.map((v, i) => ({
                sku:        v.sku || `${slug}-v${i + 1}`,
                name:       v.name,
                price:      v.price,
                stock:      v.stock,
                imageUrl:   v.imageUrl ?? null,
                attributes: v.attributes ?? {},
              })),
            }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    })
    res.status(201).json({ success: true, data: product })
  } catch (err) { next(err) }
})

// ── PATCH /api/products/:id — admin ──────────────────────────────────────────
const updateProductSchema = z.object({
  name:           z.string().min(2).optional(),
  description:    z.string().min(1).optional(),
  price:          z.number().positive().optional(),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  stock:          z.number().int().min(0).optional(),
  categoryId:     z.string().min(1).optional(),
  brandId:        z.string().optional(),
  imageUrl:       z.string().url().optional().nullable(),
  imageUrls:      z.array(z.string().url()).optional(),
  isActive:       z.boolean().optional(),
  variants:       z.array(variantInputSchema).optional(),
})

router.patch('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updates = updateProductSchema.parse(req.body)
    const { imageUrl, imageUrls, variants, ...restWithoutVariants } = updates
    const hasImageUpdate = imageUrls !== undefined || imageUrl !== undefined
    const newUrls = imageUrls?.length
      ? imageUrls
      : imageUrl ? [imageUrl] : []

    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data:  {
        ...restWithoutVariants,
        ...(hasImageUpdate && {
          images: {
            deleteMany: {},
            ...(newUrls.length ? { create: newUrls.map((url, order) => ({ url, order })) } : {}),
          },
        }),
        ...(variants !== undefined && {
          variants: {
            deleteMany: {},
            create: variants.map((v, i) => ({
              sku:        v.sku || `${req.params.id as string}-v${i + 1}`,
              name:       v.name,
              price:      v.price,
              stock:      v.stock,
              imageUrl:   v.imageUrl ?? null,
              attributes: v.attributes ?? {},
            })),
          },
        }),
      },
      include: PRODUCT_INCLUDE,
    })
    res.json({ success: true, data: product })
  } catch (err) { next(err) }
})

// ── DELETE /api/products/:id — admin ─────────────────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id as string } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export default router
