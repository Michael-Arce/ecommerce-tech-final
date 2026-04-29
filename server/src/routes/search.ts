import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import { embedQuery } from '../lib/embeddings.js'

const router = Router()

const SearchSchema = z.object({
  q:        z.string().trim().min(1).max(200).optional(),
  category: z.string().optional(),
  brand:    z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock:  z.enum(['true', 'false']).optional(),
  page:     z.coerce.number().int().positive().default(1),
  perPage:  z.coerce.number().int().positive().max(60).default(20),
  sort:     z.enum(['relevance', 'price_asc', 'price_desc', 'newest']).default('relevance'),
})

type SearchRow = {
  id: string
  slug: string
  name: string
  description: string
  price: unknown
  compare_at_price: unknown
  stock: unknown
  created_at: Date
  brand_id: string
  brand_name: string
  brand_slug: string
  category_name: string
  category_slug: string
  image_url: string | null
  score: unknown
  in_vector: boolean
  in_fts: boolean
}

// ── GET /api/search ────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const parsed = SearchSchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() })
    }

    const { q, category, brand, minPrice, maxPrice, inStock, page, perPage, sort } = parsed.data
    const offset = (page - 1) * perPage

    // ── Filter-only (no semantic query) ────────────────────────────────────────
    if (!q) {
      const where: Record<string, unknown> = { isActive: true }
      if (category) where.category = { slug: category }
      if (brand)    where.brand    = { slug: brand }
      if (minPrice != null || maxPrice != null) {
        const priceFilter: Record<string, number> = {}
        if (minPrice != null) priceFilter.gte = minPrice
        if (maxPrice != null) priceFilter.lte = maxPrice
        where.price = priceFilter
      }
      if (inStock === 'true') where.stock = { gt: 0 }

      const orderBy =
        sort === 'price_asc'  ? { price: 'asc' as const } :
        sort === 'price_desc' ? { price: 'desc' as const } :
        { createdAt: 'desc' as const }

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          orderBy,
          skip: offset,
          take: perPage,
          include: {
            images:   { orderBy: { order: 'asc' }, take: 1 },
            brand:    { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true } },
          },
        }),
      ])

      return res.json({
        success: true,
        data: {
          products: products.map(p => ({
            id:             p.id,
            slug:           p.slug,
            name:           p.name,
            description:    p.description,
            price:          p.price,
            compareAtPrice: p.compareAtPrice,
            stock:          p.stock,
            image:          p.images[0]?.url ?? null,
            brand:          p.brand,
            category:       p.category,
          })),
          total,
          page,
          perPage,
          totalPages: Math.ceil(total / perPage),
        },
      })
    }

    // ── Hybrid semantic search ──────────────────────────────────────────────────
    const vector = await embedQuery(q)
    const vectorStr = `[${vector.join(',')}]`

    const conditions: Prisma.Sql[] = [
      Prisma.sql`p."isActive" = true`,
      Prisma.sql`p.embedding IS NOT NULL`,
    ]
    if (category)        conditions.push(Prisma.sql`c.slug = ${category}`)
    if (brand)           conditions.push(Prisma.sql`b.slug = ${brand}`)
    if (minPrice != null) conditions.push(Prisma.sql`p.price >= ${minPrice}`)
    if (maxPrice != null) conditions.push(Prisma.sql`p.price <= ${maxPrice}`)
    if (inStock === 'true') conditions.push(Prisma.sql`p.stock > 0`)

    const whereClause = Prisma.join(conditions, ' AND ')

    const orderClause =
      sort === 'price_asc'  ? Prisma.sql`p.price ASC` :
      sort === 'price_desc' ? Prisma.sql`p.price DESC` :
      sort === 'newest'     ? Prisma.sql`p."createdAt" DESC` :
      Prisma.sql`rrf.score DESC`

    const rows = await prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      WITH
        filtered AS (
          SELECT p.id, p.name, p.description, p.embedding
          FROM   "Product"  p
          JOIN   "Brand"    b ON b.id = p."brandId"
          JOIN   "Category" c ON c.id = p."categoryId"
          WHERE  ${whereClause}
        ),
        vector_ranked AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY dist) AS rank
          FROM (
            SELECT id, embedding <=> ${vectorStr}::vector AS dist
            FROM   filtered
            ORDER  BY dist
            LIMIT  60
          ) t
        ),
        fts_ranked AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY fts_score DESC) AS rank
          FROM (
            SELECT id,
                   ts_rank_cd(
                     to_tsvector('english', name || ' ' || description),
                     plainto_tsquery('english', ${q})
                   ) AS fts_score
            FROM   filtered
            WHERE  to_tsvector('english', name || ' ' || description)
                   @@ plainto_tsquery('english', ${q})
            ORDER  BY fts_score DESC
            LIMIT  60
          ) t
        ),
        rrf AS (
          SELECT
            COALESCE(v.id, f.id) AS id,
            (COALESCE(1.0 / (60 + v.rank), 0) + COALESCE(1.0 / (60 + f.rank), 0)) AS score,
            v.id IS NOT NULL AS in_vector,
            f.id IS NOT NULL AS in_fts
          FROM       vector_ranked v
          FULL OUTER JOIN fts_ranked f ON v.id = f.id
        )
      SELECT
        p.id,
        p.slug,
        p.name,
        p.description,
        p.price,
        p."compareAtPrice"  AS compare_at_price,
        p.stock,
        p."createdAt"       AS created_at,
        p."brandId"         AS brand_id,
        b.name              AS brand_name,
        b.slug              AS brand_slug,
        c.name              AS category_name,
        c.slug              AS category_slug,
        (
          SELECT url FROM "ProductImage"
          WHERE  "productId" = p.id
          ORDER  BY "order"
          LIMIT  1
        ) AS image_url,
        rrf.score,
        rrf.in_vector,
        rrf.in_fts
      FROM       rrf
      JOIN       "Product"  p ON p.id  = rrf.id
      JOIN       "Brand"    b ON b.id  = p."brandId"
      JOIN       "Category" c ON c.id  = p."categoryId"
      ORDER BY   ${orderClause}
      LIMIT      ${perPage}
      OFFSET     ${offset}
    `)

    res.json({
      success: true,
      data: {
        products: rows.map(r => ({
          id:             r.id,
          slug:           r.slug,
          name:           r.name,
          description:    r.description,
          price:          Number(r.price),
          compareAtPrice: r.compare_at_price != null ? Number(r.compare_at_price) : null,
          stock:          Number(r.stock),
          image:          r.image_url,
          brandId:        r.brand_id,
          brand:          { name: r.brand_name, slug: r.brand_slug },
          category:       { name: r.category_name, slug: r.category_slug },
          _score:         Number(r.score),
          why_matched:    r.in_vector && r.in_fts ? 'semantic+text' : r.in_vector ? 'semantic' : 'text',
        })),
        page,
        perPage,
        hasMore: rows.length === perPage,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
