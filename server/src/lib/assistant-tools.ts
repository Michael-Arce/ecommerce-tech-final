import { Prisma } from '../generated/prisma/client.js'
import { prisma } from './prisma.js'
import { embedQuery } from './embeddings.js'

// ── Tool definitions — xAI/OpenAI tool-calling format ─────────────────────────

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'searchProducts',
      description:
        'Search products in the catalog by natural language query and/or filters. ' +
        'Use this to find products matching user intent before recommending.',
      parameters: {
        type: 'object',
        properties: {
          query:    { type: 'string',  description: 'Natural language search query' },
          category: { type: 'string',  description: 'Category slug (e.g. laptops, smartphones, headphones)' },
          brand:    { type: 'string',  description: 'Brand slug (e.g. apple, samsung, sony)' },
          minPrice: { type: 'number',  description: 'Minimum price in USD' },
          maxPrice: { type: 'number',  description: 'Maximum price in USD' },
          inStock:  { type: 'boolean', description: 'Only return in-stock products' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getProductDetails',
      description:
        'Get full details of a specific product including variants, specs and stock. ' +
        'Use this when the user asks about a specific product.',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Product slug identifier (e.g. iphone-15-pro)' },
        },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'compareProducts',
      description:
        'Compare 2 or 3 products side by side on price, specs and stock. ' +
        'Use this when the user wants to choose between specific products.',
      parameters: {
        type: 'object',
        properties: {
          slugs: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of 2–3 product slugs to compare',
          },
        },
        required: ['slugs'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'addToCart',
      description:
        'Add a product to the user cart. ' +
        'Only call this after explicit user confirmation ("add it", "buy it", "add to cart").',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Product ID to add' },
          variantId: { type: 'string', description: 'Variant ID when the product has color/storage variants' },
          quantity:  { type: 'number', description: 'Quantity to add (default: 1)' },
        },
        required: ['productId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getCartSummary',
      description: 'Get the current cart contents and total for the logged-in user.',
      parameters: { type: 'object', properties: {} },
    },
  },
] as const

// ── Tool implementations ───────────────────────────────────────────────────────

const SEARCH_LIMIT = 8

type SearchParams = {
  query?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

type SearchRow = {
  id: string; slug: string; name: string
  price: unknown; compare_at_price: unknown; stock: unknown
  brand_name: string; category_name: string; image_url: string | null
}

async function searchProducts(params: SearchParams) {
  const { query, category, brand, minPrice, maxPrice, inStock } = params

  if (query) {
    const vector    = await embedQuery(query)
    const vectorStr = `[${vector.join(',')}]`

    const conditions: Prisma.Sql[] = [
      Prisma.sql`p."isActive" = true`,
      Prisma.sql`p.embedding IS NOT NULL`,
    ]
    if (category)         conditions.push(Prisma.sql`c.slug = ${category}`)
    if (brand)            conditions.push(Prisma.sql`b.slug = ${brand}`)
    if (minPrice != null) conditions.push(Prisma.sql`p.price >= ${minPrice}`)
    if (maxPrice != null) conditions.push(Prisma.sql`p.price <= ${maxPrice}`)
    if (inStock)          conditions.push(Prisma.sql`p.stock > 0`)

    const rows = await prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      WITH
        filtered AS (
          SELECT p.id, p.name, p.description, p.embedding
          FROM "Product" p
          JOIN "Brand" b    ON b.id = p."brandId"
          JOIN "Category" c ON c.id = p."categoryId"
          WHERE ${Prisma.join(conditions, ' AND ')}
        ),
        vr AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY dist) AS rank
          FROM (SELECT id, embedding <=> ${vectorStr}::vector AS dist FROM filtered ORDER BY dist LIMIT 40) t
        ),
        fr AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC) AS rank
          FROM (
            SELECT id, ts_rank_cd(to_tsvector('english', name || ' ' || description),
                                  plainto_tsquery('english', ${query})) AS score
            FROM filtered
            WHERE to_tsvector('english', name || ' ' || description)
                  @@ plainto_tsquery('english', ${query})
            ORDER BY score DESC LIMIT 40
          ) t
        ),
        rrf AS (
          SELECT COALESCE(vr.id, fr.id) AS id,
                 (COALESCE(1.0/(60+vr.rank),0) + COALESCE(1.0/(60+fr.rank),0)) AS score
          FROM vr FULL OUTER JOIN fr ON vr.id = fr.id
        )
      SELECT p.id, p.slug, p.name, p.price,
             p."compareAtPrice" AS compare_at_price, p.stock,
             b.name AS brand_name, c.name AS category_name,
             (SELECT url FROM "ProductImage" WHERE "productId" = p.id ORDER BY "order" LIMIT 1) AS image_url
      FROM rrf
      JOIN "Product"  p ON p.id = rrf.id
      JOIN "Brand"    b ON b.id = p."brandId"
      JOIN "Category" c ON c.id = p."categoryId"
      ORDER BY rrf.score DESC
      LIMIT ${SEARCH_LIMIT}
    `)

    return rows.map(r => ({
      id: r.id, slug: r.slug, name: r.name,
      price: Number(r.price),
      compareAtPrice: r.compare_at_price != null ? Number(r.compare_at_price) : null,
      stock: Number(r.stock),
      brand: r.brand_name, category: r.category_name, image: r.image_url,
    }))
  }

  const where: Record<string, unknown> = { isActive: true }
  if (category) where.category = { slug: category }
  if (brand)    where.brand    = { slug: brand }
  if (minPrice != null || maxPrice != null) {
    const p: Record<string, number> = {}
    if (minPrice != null) p.gte = minPrice
    if (maxPrice != null) p.lte = maxPrice
    where.price = p
  }
  if (inStock) where.stock = { gt: 0 }

  const products = await prisma.product.findMany({
    where, take: SEARCH_LIMIT, orderBy: { createdAt: 'desc' },
    include: { brand: true, category: true, images: { orderBy: { order: 'asc' }, take: 1 } },
  })

  return products.map(p => ({
    id: p.id, slug: p.slug, name: p.name,
    price: p.price, compareAtPrice: p.compareAtPrice ?? null, stock: p.stock,
    brand: p.brand.name, category: p.category.name, image: p.images[0]?.url ?? null,
  }))
}

async function getProductDetails(params: { slug: string }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      brand: true, category: true,
      images:   { orderBy: { order: 'asc' } },
      variants: true,
    },
  })

  if (!product) return { error: `Product "${params.slug}" not found in catalog` }

  return {
    id: product.id, slug: product.slug, name: product.name,
    description: product.description,
    price: product.price, compareAtPrice: product.compareAtPrice ?? null,
    stock: product.stock, brand: product.brand.name, category: product.category.name,
    images: product.images.map(i => i.url),
    variants: product.variants.map(v => ({
      id: v.id, name: v.name, price: v.price, stock: v.stock,
      attributes: v.attributes,
    })),
  }
}

async function compareProducts(params: { slugs: string[] }) {
  if (params.slugs.length < 2) return { error: 'Need at least 2 product slugs to compare' }

  const products = await Promise.all(
    params.slugs.slice(0, 3).map(slug =>
      prisma.product.findUnique({
        where: { slug },
        include: { brand: true, category: true, variants: true },
      })
    )
  )

  const found = products.filter(Boolean)
  if (found.length < 2) return { error: 'Could not find enough products to compare. Check the slugs.' }

  return found.map(p => ({
    id: p!.id, slug: p!.slug, name: p!.name,
    price: p!.price, compareAtPrice: p!.compareAtPrice ?? null, stock: p!.stock,
    brand: p!.brand.name, category: p!.category.name,
    description: p!.description.slice(0, 250),
    variants: p!.variants.map(v => ({ name: v.name, price: v.price, stock: v.stock, attributes: v.attributes })),
  }))
}

async function addToCart(
  params: { productId: string; variantId?: string; quantity?: number },
  userId: string,
) {
  const qty = Math.min(10, Math.max(1, params.quantity ?? 1))

  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  })
  if (!product) return { error: `Product "${params.productId}" not found` }

  const variant = params.variantId
    ? await prisma.productVariant.findUnique({ where: { id: params.variantId } })
    : null

  const price    = variant?.price    ?? product.price
  const imageUrl = variant?.imageUrl ?? product.images[0]?.url ?? ''

  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId: params.productId, variantId: params.variantId ?? null },
  })

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data:  { quantity: existing.quantity + qty },
      })
    : await prisma.cartItem.create({
        data: {
          userId, productId: params.productId,
          variantId: params.variantId ?? null,
          name: product.name, price, imageUrl, quantity: qty,
        },
      })

  const allItems  = await prisma.cartItem.findMany({ where: { userId } })
  const cartTotal = allItems.reduce((s, i) => s + i.price * i.quantity, 0)

  return {
    success: true,
    added: { name: product.name, quantity: item.quantity, price: item.price },
    cartTotal: Math.round(cartTotal * 100) / 100,
  }
}

async function getCartSummary(userId: string) {
  const items = await prisma.cartItem.findMany({ where: { userId } })

  if (items.length === 0) return { items: [], itemCount: 0, total: 0 }

  return {
    items: items.map(i => ({
      name: i.name, quantity: i.quantity, unitPrice: i.price,
      lineTotal: Math.round(i.price * i.quantity * 100) / 100,
    })),
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    total:     Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100,
  }
}

// ── Executor factory ───────────────────────────────────────────────────────────

export type ToolName = keyof typeof toolMap

const toolMap = {
  searchProducts:    (args: Record<string, unknown>, _userId: string | null) =>
    searchProducts(args as SearchParams),
  getProductDetails: (args: Record<string, unknown>, _userId: string | null) =>
    getProductDetails(args as { slug: string }),
  compareProducts:   (args: Record<string, unknown>, _userId: string | null) =>
    compareProducts(args as { slugs: string[] }),
  addToCart: (args: Record<string, unknown>, userId: string | null) => {
    if (!userId) return Promise.resolve({ error: 'User must be logged in to add items to cart' })
    return addToCart(args as { productId: string; variantId?: string; quantity?: number }, userId)
  },
  getCartSummary: (_args: Record<string, unknown>, userId: string | null) => {
    if (!userId) return Promise.resolve({ error: 'User must be logged in to view cart' })
    return getCartSummary(userId)
  },
}

export function createToolExecutor(userId: string | null) {
  return async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const fn = toolMap[name as ToolName]
    if (!fn) return { error: `Unknown tool: ${name}` }
    return fn(args, userId)
  }
}
