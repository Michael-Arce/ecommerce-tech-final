import type { Request, Response, NextFunction } from 'express'
import { logger } from '../lib/logger.js'

const INJECTION_PATTERNS = [
  // English
  'ignore all', 'ignore previous', 'ignore your', 'ignore these',
  'forget your', 'forget all', 'forget previous',
  'you are now', 'pretend you', 'act as if', 'act as a',
  'new instructions', 'system prompt', 'bypass',
  'jailbreak', 'dan mode', 'without restrictions',
  'no restrictions', 'ignore rules', 'ignore instructions',
  'reveal your instructions', 'show your instructions',
  'what are your instructions', 'override your',
  // Spanish
  'ignora tus', 'ignora todas', 'ignora las instrucciones',
  'olvida tus', 'olvida todo', 'olvida las instrucciones',
  'ahora eres', 'finge que eres', 'actua como si', 'actúa como si',
  'sin restricciones', 'nuevas instrucciones',
  'cuales son tus instrucciones', 'cuáles son tus instrucciones',
  'muestra tus instrucciones', 'revela tus instrucciones',
]

function normalize(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/5/g, 's')
}

function hasInjection(text: string): boolean {
  const norm = normalize(text)
  if (INJECTION_PATTERNS.some((p) => norm.includes(p))) return true
  // Spaced-out attack: "i g n o r e  a l l"
  const collapsed = norm.replace(/(?<=[a-z])\s(?=[a-z])/g, '')
  return INJECTION_PATTERNS.some((p) => collapsed.includes(p))
}

// In-memory strike tracker — works correctly on single-worker deploys (Render)
const strikes = new Map<string, { count: number; bannedUntil: number }>()
const STRIKE_LIMIT = 3
const BAN_MS = 10 * 60 * 1000

function getIp(req: Request): string {
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown'
}

export function _resetStrikesForTesting(): void {
  strikes.clear()
}

export function injectionGuard(req: Request, res: Response, next: NextFunction): void {
  const ip = getIp(req)
  const now = Date.now()

  const record = strikes.get(ip)

  if (record?.bannedUntil && record.bannedUntil > now) {
    logger.warn('banned ip blocked', { ip })
    res.status(429).json({ success: false, message: 'Too many suspicious requests. Try again later.' })
    return
  }

  if (record && record.bannedUntil > 0 && record.bannedUntil <= now) strikes.delete(ip)

  const body = req.body as { message?: unknown; history?: unknown[] }
  const message = typeof body.message === 'string' ? body.message : ''
  const history = Array.isArray(body.history) ? body.history : []

  const suspicious =
    hasInjection(message) ||
    history.some((m) => {
      const entry = m as Record<string, unknown>
      return typeof entry.content === 'string' && hasInjection(entry.content)
    })

  if (!suspicious) {
    next()
    return
  }

  const current = strikes.get(ip) ?? { count: 0, bannedUntil: 0 }
  current.count++

  if (current.count >= STRIKE_LIMIT) {
    current.bannedUntil = now + BAN_MS
    strikes.set(ip, current)
    res.status(429).json({ success: false, message: 'Too many suspicious requests. Try again later.' })
    return
  }

  strikes.set(ip, current)
  logger.warn('injection attempt', { ip, strike: current.count, message: message.slice(0, 80) })
  res.status(400).json({ success: false, message: 'Invalid request.' })
}
