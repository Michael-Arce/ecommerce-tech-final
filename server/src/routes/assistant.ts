import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import type { Request, Response, NextFunction } from 'express'
import type { AuthPayload } from '../types.js'
import { streamAssistant } from '../lib/assistant-orchestrator.js'
import { injectionGuard } from '../middleware/injection-guard.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
})

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role:    z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .max(20)
    .default([]),
})

function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      req.auth = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload
    } catch { /* guest — continue */ }
  }
  next()
}

// ── POST /api/assistant/chat ───────────────────────────────────────────────────

router.post('/chat', aiLimiter, injectionGuard, optionalAuth, async (req, res) => {
  const parsed = chatSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.issues[0].message })
    return
  }

  const { message, history } = parsed.data
  const userId = req.auth?.userId ?? null

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  function send(event: Record<string, unknown>) {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  try {
    for await (const chunk of streamAssistant(message, history, userId)) {
      send({ type: 'chunk', content: chunk })
    }
    send({ type: 'done' })
  } catch (err) {
    // Never expose internal LLM or DB errors to the client
    const isConfigError = err instanceof Error && err.message.includes('API_KEY')
    const message = isConfigError
      ? 'Assistant is not configured. Contact support.'
      : 'The assistant is temporarily unavailable. Please try again.'
    send({ type: 'error', message })
  } finally {
    res.end()
  }
})

export default router
