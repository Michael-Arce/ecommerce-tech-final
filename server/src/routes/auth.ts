import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'
import type { User, AuthPayload } from '../types.js'

const router = Router()

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production')
  }
}

const JWT_SECRET         = process.env.JWT_SECRET         ?? 'dev-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many accounts created, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

function makeTokens(userId: string, role: string) {
  const access  = jwt.sign({ userId, role } as AuthPayload, JWT_SECRET,         { expiresIn: '15m' })
  const refresh = jwt.sign({ userId, role } as AuthPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
  return { access, refresh }
}

function setRefreshCookie(res: import('express').Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('refreshToken', token, {
    httpOnly: true,
    // cross-origin (Vercel frontend + Render backend) requires sameSite:'none'
    // sameSite:'none' is only valid with secure:true (HTTPS), so keep lax for local dev
    sameSite: isProd ? 'none' : 'lax',
    secure:   isProd,
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     '/api/auth/refresh',
  })
}

function safeUser(u: User & { passwordHash: string }) {
  const { passwordHash: _, role: __, ...rest } = u
  return rest
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
})

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }
    const { access, refresh } = makeTokens(user.id, user.role)
    setRefreshCookie(res, refresh)
    res.json({ success: true, data: safeUser(user as any), accessToken: access })
  } catch (err) { next(err) }
})

// ── POST /api/auth/register ───────────────────────────────────────────────────
const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName:  z.string().min(2),
  email:     z.string().email(),
  password:  z.string().min(8),
})

router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already in use' })
      return
    }
    const user = await prisma.user.create({
      data: {
        email:        data.email,
        passwordHash: await bcrypt.hash(data.password, 10),
        firstName:    data.firstName,
        lastName:     data.lastName,
        role:         data.email.endsWith('@premiumtech.com') ? 'admin' : 'customer',
      },
    })
    const { access, refresh } = makeTokens(user.id, user.role)
    setRefreshCookie(res, refresh)
    res.status(201).json({ success: true, data: safeUser(user as any), accessToken: access })
  } catch (err) { next(err) }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } })
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    res.json({ success: true, data: safeUser(user as any) })
  } catch (err) { next(err) }
})

// ── PATCH /api/auth/me ────────────────────────────────────────────────────────
const updateMeSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName:  z.string().min(2).optional(),
})

router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const data = updateMeSchema.parse(req.body)
    const user = await prisma.user.update({ where: { id: req.auth!.userId }, data })
    res.json({ success: true, data: safeUser(user as any) })
  } catch (err) { next(err) }
})

// ── PATCH /api/auth/me/password ───────────────────────────────────────────────
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
})

router.patch('/me/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } })
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' })
      return
    }
    await prisma.user.update({
      where: { id: user.id },
      data:  { passwordHash: await bcrypt.hash(newPassword, 10) },
    })
    res.json({ success: true, message: 'Password updated' })
  } catch (err) { next(err) }
})

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refreshToken as string | undefined
  if (!token) { res.status(401).json({ success: false, message: 'No refresh token' }); return }
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as AuthPayload
    const { access, refresh } = makeTokens(payload.userId, payload.role)
    setRefreshCookie(res, refresh)
    res.json({ success: true, accessToken: access })
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' })
  }
})

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', (_req, res) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure:   isProd,
    path:     '/api/auth/refresh',
  })
  res.json({ success: true })
})

// ── POST /api/auth/forgot-password / reset-password (mock) ───────────────────
const forgotPasswordSchema = z.object({ email: z.string().email() })

router.post('/forgot-password', forgotPasswordLimiter, (req, res, next) => {
  try {
    forgotPasswordSchema.parse(req.body)
    res.json({ success: true, message: 'Reset link sent (mock)' })
  } catch (err) { next(err) }
})

router.post('/reset-password', (_req, res) => {
  res.json({ success: true, message: 'Password reset successful (mock)' })
})

export default router
