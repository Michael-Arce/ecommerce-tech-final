import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_URL } from '@/shared/config/env'
import type { ApiError } from '@/shared/types/api.types'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Access token (in-memory, cleared on page reload) ─────────────────────────
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

// ── Request interceptor — attach Authorization header ─────────────────────────
apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Callback registered by the auth feature to handle logout on refresh failure.
// This avoids a FSD boundary violation (shared cannot import from features).
let onRefreshFailure: (() => void) | null = null

export function registerRefreshFailureHandler(handler: () => void) {
  onRefreshFailure = handler
}

// ── Refresh token interceptor with 401 queue ─────────────────────────────────
// IMPORTANT: must be registered BEFORE the error normalization interceptor.
// Axios runs response interceptors in registration order (FIFO). If normalization
// ran first it would create a new ApiError object without `config`, making the
// retry below impossible.
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}> = []

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(undefined)
    }
  })
  failedQueue = []
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      config.url?.includes('/api/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => apiClient(config))
        .catch((err) => Promise.reject(err))
    }

    config._retry = true
    isRefreshing = true

    try {
      const response = await apiClient.post<{ success: boolean; accessToken: string }>(
        '/api/auth/refresh',
      )
      setAccessToken(response.data.accessToken)
      processQueue(null)
      return apiClient(config)
    } catch (refreshError) {
      processQueue(refreshError)
      onRefreshFailure?.()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// ── Error normalization interceptor ──────────────────────────────────────────
// Registered AFTER the refresh interceptor so it only sees errors that are
// truly final (refresh already attempted or non-401).
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const data = error.response?.data as Record<string, unknown> | undefined
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message: error.response
        ? (data?.message as string | undefined) ?? error.message
        : 'Network error',
      code: data?.code as string | undefined,
      fieldErrors:
        error.response?.status === 422
          ? (data?.errors as Record<string, string[]> | undefined)
          : undefined,
    }
    return Promise.reject(apiError)
  },
)
