export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  message?: string
}

export interface ApiError {
  status: number
  message: string
  code?: string
  fieldErrors?: Record<string, string[]>
}
