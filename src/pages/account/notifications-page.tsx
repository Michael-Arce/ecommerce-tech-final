import { useEffect } from 'react'
import { ShoppingCart, User, Package, Bell, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Button, PageTitle } from '@/shared/ui'
import { useNotificationStore, type AppNotification, type NotificationType } from '@/entities/notification'

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  cart:    <ShoppingCart className="h-4 w-4" />,
  account: <User className="h-4 w-4" />,
  order:   <Package className="h-4 w-4" />,
}

const TYPE_COLOR: Record<NotificationType, string> = {
  cart:    'bg-blue-100 text-blue-600',
  account: 'bg-purple-100 text-purple-600',
  order:   'bg-green-100 text-green-600',
}

function timeAgo(ts: number, t: TFunction): string {
  const diff = Date.now() - ts
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return t('account.notifications.justNow')
  if (mins < 60)  return t('account.notifications.minutesAgo', { count: mins })
  if (hours < 24) return t('account.notifications.hoursAgo', { count: hours })
  return t('account.notifications.daysAgo', { count: days })
}

function NotificationRow({ n, t }: { n: AppNotification; t: TFunction }) {
  return (
    <div className={`flex items-start gap-4 rounded-lg border p-4 transition-all duration-300 ${
      n.read ? 'border-secondary/15 bg-surface' : 'border-l-accent border-l-2 border-secondary/15 bg-accent/[0.08]'
    }`}>
      {!n.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
      )}
      {n.read && <span className="mt-1.5 h-2 w-2 shrink-0" />}

      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TYPE_COLOR[n.type]}`}>
        {TYPE_ICON[n.type]}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${n.read ? 'text-secondary' : 'font-medium text-text'}`}>
          {n.message}
        </p>
      </div>

      <span className="shrink-0 text-xs text-muted">{timeAgo(n.createdAt, t)}</span>
    </div>
  )
}

export function NotificationsPage() {
  const { t } = useTranslation()
  const notifications      = useNotificationStore((s) => s.notifications)
  const markAllRead        = useNotificationStore((s) => s.markAllRead)
  const clearNotifications = useNotificationStore((s) => s.clearNotifications)
  const unreadCount        = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (unreadCount > 0) markAllRead()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle>{t('account.notifications.title')}</PageTitle>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearNotifications} className="gap-1.5 text-secondary hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            {t('account.notifications.clearAll')}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background">
            <Bell className="h-6 w-6 text-muted" />
          </span>
          <p className="text-sm text-secondary">{t('account.notifications.empty')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationRow key={n.id} n={n} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}
