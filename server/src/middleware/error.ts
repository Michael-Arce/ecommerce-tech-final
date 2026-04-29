import { ZodError } from 'zod'
import type { Request, Response, NextFunction } from 'express'
import { logger } from '../lib/logger.js'

const isProd = process.env.NODE_ENV === 'production'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({ success: false, message: 'Validation error', errors: err.errors })
    return
  }

  const status = (err instanceof Error && 'status' in err && typeof err.status === 'number')
    ? err.status
    : 500

  logger.error('unhandled error', err instanceof Error ? { message: err.message, stack: err.stack } : err)

  const message = isProd
    ? status < 500 ? (err instanceof Error ? err.message : 'Bad request') : 'Internal server error'
    : err instanceof Error ? err.message : 'Internal server error'

  res.status(status).json({ success: false, message })
}
