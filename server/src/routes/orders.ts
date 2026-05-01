import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { generateAddiPaymentLink } from '../lib/addi.js'

const router = Router()

const ORDER_INCLUDE = {
  items:           { include: { product: true, variant: true } },
  shippingAddress: true,
}

// ── GET /api/orders ───────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const isAdmin = req.auth!.role === 'admin'
    const data = await prisma.order.findMany({
      where:   isAdmin ? undefined : { userId: req.auth!.userId },
      orderBy: { createdAt: 'desc' },
      include: ORDER_INCLUDE,
    })
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where:   { id: req.params.id as string },
      include: ORDER_INCLUDE,
    })
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return }
    const isOwner = order.userId === req.auth!.userId
    const isAdmin = req.auth!.role === 'admin'
    if (!isOwner && !isAdmin) { res.status(403).json({ success: false, message: 'Forbidden' }); return }
    res.json({ success: true, data: order })
  } catch (err) { next(err) }
})

// ── POST /api/orders — place order ────────────────────────────────────────────
const placeOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity:  z.number().int().positive(),
    imageUrl:  z.string(),
  })).min(1).max(50),
  shippingAddress: z.object({
    street:  z.string().min(1),
    city:    z.string().min(1),
    country: z.string().min(1),
    cedula:  z.string().min(5),
    celular: z.string().min(10),
  }),
})

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { items, shippingAddress } = placeOrderSchema.parse(req.body)

    const productIds = [...new Set(items.map((i) => i.productId))]
    const products = await prisma.product.findMany({
      where:   { id: { in: productIds }, isActive: true },
      include: { variants: true },
    })

    const resolvedItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) throw Object.assign(new Error('Product not found'), { status: 400 })
      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null
      if (item.variantId && !variant) throw Object.assign(new Error('Variant not found'), { status: 400 })
      const price = variant?.price ?? product.price
      return { ...item, name: product.name, price }
    })

    const subtotal = resolvedItems.reduce((s, i) => s + i.price * i.quantity, 0)

    const order = await prisma.order.create({
      data: {
        user:   { connect: { id: req.auth!.userId } },
        status: 'pending',
        total:  Number((subtotal * 1.1).toFixed(2)),
        shippingAddress: {
          create: { ...shippingAddress, userId: req.auth!.userId, isDefault: false },
        },
        items: {
          create: resolvedItems.map((item) => ({
            name:      item.name,
            price:     item.price,
            quantity:  item.quantity,
            imageUrl:  item.imageUrl,
            productId: item.productId,
            variantId: item.variantId,
          })),
        },
      },
      include: ORDER_INCLUDE,
    })
    
    const paymentUrl = await generateAddiPaymentLink(
      { id: order.id, total: order.total },
      { cedula: shippingAddress.cedula, celular: shippingAddress.celular }
    )
    res.status(201).json({ success: true, data: { ...order, paymentUrl } })
  } catch (err) { next(err) }
})

// ── PATCH /api/orders/:id/cancel — owner only ────────────────────────────────
router.patch('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id as string } })
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return }
    if (order.userId !== req.auth!.userId) { res.status(403).json({ success: false, message: 'Forbidden' }); return }
    if (!['pending', 'processing'].includes(order.status)) {
      res.status(400).json({ success: false, message: 'Order cannot be cancelled' }); return
    }
    const updated = await prisma.order.update({
      where:   { id: order.id },
      data:    { status: 'cancelled' },
      include: ORDER_INCLUDE,
    })
    res.json({ success: true, data: updated })
  } catch (err) { next(err) }
})

// ── PATCH /api/orders/:id/status — admin ─────────────────────────────────────
const statusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
})

router.patch('/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body)
    const order = await prisma.order.update({
      where:   { id: req.params.id as string },
      data:    { status },
      include: ORDER_INCLUDE,
    })
    res.json({ success: true, data: order })
  } catch (err) { next(err) }
})

export default router
