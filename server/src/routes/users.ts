import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

function safeUser(u: { passwordHash: string; [key: string]: any }) {
  const { passwordHash: _, ...rest } = u
  return rest
}

router.get('/', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
    res.json({ success: true, data: users.map(safeUser) })
  } catch (err) { next(err) }
})

const updateUserSchema = z.object({
  role:      z.enum(['customer', 'admin']).optional(),
  firstName: z.string().min(2).optional(),
  lastName:  z.string().min(2).optional(),
})

router.patch('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body)
    const user = await prisma.user.update({ where: { id: req.params.id as string }, data })
    res.json({ success: true, data: safeUser(user) })
  } catch (err) { next(err) }
})

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export default router
