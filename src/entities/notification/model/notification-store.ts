import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'cart' | 'account' | 'order'

export interface AppNotification {
  id: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: number
}

interface NotificationState {
  notifications: AppNotification[]
  lastSeenOrderStatuses: Record<string, string>
  addNotification: (message: string, type: NotificationType) => void
  markAllRead: () => void
  clearNotifications: () => void
  setLastSeenOrderStatuses: (statuses: Record<string, string>) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      lastSeenOrderStatuses: {},

      addNotification: (message, type) =>
        set((state) => ({
          notifications: [
            { id: crypto.randomUUID(), message, type, read: false, createdAt: Date.now() },
            ...state.notifications,
          ].slice(0, 50),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearNotifications: () => set({ notifications: [], lastSeenOrderStatuses: {} }),

      setLastSeenOrderStatuses: (statuses) => set({ lastSeenOrderStatuses: statuses }),
    }),
    { name: 'ecommerce-notifications' },
  ),
)
