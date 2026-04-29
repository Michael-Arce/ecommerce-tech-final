import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { cacheGet, cacheSet, cacheInvalidate } from '../lib/mem-cache.js'

const router = Router()
const CACHE_KEY = 'brands:all'
const CC_HEADER  = 'public, max-age=300, stale-while-revalidate=60'

router.get('/', async (_req, res, next) => {
  try {
    const cached = cacheGet<object[]>(CACHE_KEY)
    if (cached) {
      res.setHeader('Cache-Control', CC_HEADER)
      res.json({ success: true, data: cached })
      return
    }
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })
    cacheSet(CACHE_KEY, brands)
    res.setHeader('Cache-Control', CC_HEADER)
    res.json({ success: true, data: brands })
  } catch (err) { next(err) }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({ where: { slug: req.params.slug } })
    if (!brand) { res.status(404).json({ success: false, message: 'Brand not found' }); return }
    res.json({ success: true, data: brand })
  } catch (err) { next(err) }
})

// ── POST /api/brands — admin ──────────────────────────────────────────────────
const brandSchema = z.object({
  name:      z.string().min(2),
  slug:      z.string().min(2).regex(/^[a-z0-9-]+$/),
  tagline:   z.object({ en: z.string().min(2), es: z.string().min(2) }),
  bgColor:   z.string().min(4),
  logoUrl:   z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
})

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = brandSchema.parse(req.body)
    const brand = await prisma.brand.create({
      data: {
        ...data,
        logoUrl:   data.logoUrl   || null,
        bannerUrl: data.bannerUrl || null,
      },
    })
    cacheInvalidate(CACHE_KEY)
    res.status(201).json({ success: true, data: brand })
  } catch (err) { next(err) }
})

// ── PATCH /api/brands/:id — admin ─────────────────────────────────────────────
router.patch('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = brandSchema.partial().parse(req.body)
    const brand = await prisma.brand.update({
      where: { id: req.params.id as string },
      data:  {
        ...data,
        logoUrl:   data.logoUrl   === '' ? null : data.logoUrl,
        bannerUrl: data.bannerUrl === '' ? null : data.bannerUrl,
      },
    })
    cacheInvalidate(CACHE_KEY)
    res.json({ success: true, data: brand })
  } catch (err) { next(err) }
})

// ── DELETE /api/brands/:id — admin ────────────────────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.brand.delete({ where: { id: req.params.id as string } })
    cacheInvalidate(CACHE_KEY)
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
