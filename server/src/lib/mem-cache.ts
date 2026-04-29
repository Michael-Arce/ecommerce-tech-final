type Entry<T> = { data: T; expiresAt: number }

const store = new Map<string, Entry<unknown>>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { store.delete(key); return null }
  return entry.data as T
}

export function cacheSet<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function cacheInvalidate(...keys: string[]): void {
  keys.forEach(k => store.delete(k))
}
