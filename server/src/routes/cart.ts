import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const itemSchema = z.object({
  productId: z.string(),
  variantId:  z.string().optional().nullable(),
  name:      z.string(),
  price:     z.number(),
  imageUrl:  z.string().default(''),
  quantity:  z.number().int().min(1),
})

// ── GET /api/cart ─────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({ where: { userId: req.auth!.userId } })
    res.json({ success: true, data: items })
  } catch (err) { next(err) }
})

// ── PUT /api/cart/items — upsert (set absolute quantity) ─────────────────────
router.put('/items', authenticate, async (req, res, next) => {
  try {
    const { productId, variantId, name, price, imageUrl, quantity } = itemSchema.parse(req.body)
    const userId = req.auth!.userId

    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, variantId: variantId ?? null },
    })

    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity, name, price, imageUrl },
        })
      : await prisma.cartItem.create({
          data: { userId, productId, variantId, name, price, imageUrl, quantity },
        })

    res.json({ success: true, data: item })
  } catch (err) { next(err) }
})

// ── DELETE /api/cart/items — remove one item ──────────────────────────────────
router.delete('/items', authenticate, async (req, res, next) => {
  try {
    const { productId, variantId } = z.object({
      productId: z.string(),
      variantId:  z.string().optional().nullable(),
    }).parse(req.body)

    await prisma.cartItem.deleteMany({
      where: { userId: req.auth!.userId, productId, variantId: variantId ?? null },
    })

    res.json({ success: true })
  } catch (err) { next(err) }
})

// ── DELETE /api/cart — clear all ──────────────────────────────────────────────
router.delete('/', authenticate, async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.auth!.userId } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ── POST /api/cart/merge — bulk merge on login ────────────────────────────────
router.post('/merge', authenticate, async (req, res, next) => {
  try {
    const items = z.array(itemSchema).max(100).parse(req.body.items)
    const userId = req.auth!.userId

    for (const item of items) {
      const existing = await prisma.cartItem.findFirst({
        where: { userId, productId: item.productId, variantId: item.variantId ?? null },
      })
      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        })
      } else {
        await prisma.cartItem.create({
          data: { userId, ...item, variantId: item.variantId ?? null },
        })
      }
    }

    const merged = await prisma.cartItem.findMany({ where: { userId } })
    res.json({ success: true, data: merged })
  } catch (err) { next(err) }
})

export default router
