const RING_SIZE = 200

type RouteStats = {
  requests: number
  errors_4xx: number
  errors_5xx: number
  latencies: number[]
}

const routes = new Map<string, RouteStats>()
const startedAt = Date.now()

const ai = {
  groq_calls:    0,
  groq_errors:   0,
  cohere_calls:  0,
  cohere_errors: 0,
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)]
}

export function recordRequest(
  method: string,
  route: string,
  status: number,
  durationMs: number,
): void {
  const key = `${method} ${route}`
  if (!routes.has(key)) {
    routes.set(key, { requests: 0, errors_4xx: 0, errors_5xx: 0, latencies: [] })
  }
  const s = routes.get(key)!
  s.requests++
  if (status >= 500) s.errors_5xx++
  else if (status >= 400) s.errors_4xx++
  if (s.latencies.length >= RING_SIZE) s.latencies.shift()
  s.latencies.push(durationMs)
}

export function recordAiCall(provider: 'groq' | 'cohere', error = false): void {
  if (provider === 'groq') {
    ai.groq_calls++
    if (error) ai.groq_errors++
  } else {
    ai.cohere_calls++
    if (error) ai.cohere_errors++
  }
}

export function getMetricsSnapshot() {
  const routeStats: Record<string, object> = {}
  for (const [key, s] of routes) {
    routeStats[key] = {
      requests:   s.requests,
      errors_4xx: s.errors_4xx,
      errors_5xx: s.errors_5xx,
      latency_ms: {
        p50: percentile(s.latencies, 50),
        p95: percentile(s.latencies, 95),
        p99: percentile(s.latencies, 99),
      },
    }
  }
  return {
    uptime_s: Math.floor((Date.now() - startedAt) / 1000),
    ai,
    routes: routeStats,
  }
}
