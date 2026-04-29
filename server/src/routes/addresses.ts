import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const addressSchema = z.object({
  street:    z.string().min(1),
  city:      z.string().min(1),
  state:     z.string().min(1),
  country:   z.string().min(1),
  zipCode:   z.string().min(3),
  isDefault: z.boolean().optional().default(false),
})

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = await prisma.address.findMany({ where: { userId: req.auth!.userId } })
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

router.post('/', authenticate, async (req, res, next) => {
  try {
    const data = addressSchema.parse(req.body)
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.auth!.userId },
        data:  { isDefault: false },
      })
    }
    const address = await prisma.address.create({
      data: { ...data, userId: req.auth!.userId },
    })
    res.status(201).json({ success: true, data: address })
  } catch (err) { next(err) }
})

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const updates = addressSchema.partial().parse(req.body)
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id as string, userId: req.auth!.userId },
    })
    if (!existing) { res.status(404).json({ success: false, message: 'Address not found' }); return }
    if (updates.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.auth!.userId },
        data:  { isDefault: false },
      })
    }
    const address = await prisma.address.update({ where: { id: req.params.id as string }, data: updates })
    res.json({ success: true, data: address })
  } catch (err) { next(err) }
})

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id as string, userId: req.auth!.userId },
    })
    if (!existing) { res.status(404).json({ success: false, message: 'Address not found' }); return }
    await prisma.address.delete({ where: { id: req.params.id as string } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export default router
