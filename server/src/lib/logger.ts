const IS_PROD = process.env.NODE_ENV === 'production'
const LEVEL = process.env.LOG_LEVEL ?? (IS_PROD ? 'info' : 'debug')

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const
type Level = keyof typeof LEVELS

function emit(level: Level, msg: string, meta?: unknown): void {
  if (LEVELS[level] < LEVELS[LEVEL as Level ?? 'debug']) return
  const line = JSON.stringify({
    ts:    new Date().toISOString(),
    level,
    msg,
    ...(meta !== undefined ? { meta } : {}),
  })
  level === 'error' || level === 'warn' ? console.error(line) : console.log(line)
}

export const logger = {
  debug: (msg: string, meta?: unknown) => emit('debug', msg, meta),
  info:  (msg: string, meta?: unknown) => emit('info',  msg, meta),
  warn:  (msg: string, meta?: unknown) => emit('warn',  msg, meta),
  error: (msg: string, meta?: unknown) => emit('error', msg, meta),
}
