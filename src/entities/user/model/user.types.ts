export type UserRole = 'customer' | 'admin'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role?: UserRole
  createdAt: string
}
