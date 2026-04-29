import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthPayload } from '../types.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload
    req.auth = payload
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Token expired or invalid' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Forbidden' })
    return
  }
  next()
}
