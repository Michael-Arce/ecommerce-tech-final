import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Bell, ShoppingCart, User, Package } from 'lucide-react'
import { useNotificationStore, type AppNotification, type NotificationType } from '@/entities/notification'

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  cart:    <ShoppingCart className="h-3.5 w-3.5" />,
  account: <User className="h-3.5 w-3.5" />,
  order:   <Package className="h-3.5 w-3.5" />,
}

const TYPE_COLOR: Record<NotificationType, string> = {
  cart:    'bg-blue-100 text-blue-600',
  account: 'bg-purple-100 text-purple-600',
  order:   'bg-green-100 text-green-600',
}

function timeAgo(ts: number, t: TFunction): string {
  const diff  = Date.now() - ts
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return t('account.notifications.justNow')
  if (mins < 60)  return t('account.notifications.minutesAgo', { count: mins })
  if (hours < 24) return t('account.notifications.hoursAgo', { count: hours })
  return t('account.notifications.daysAgo', { count: days })
}

function NotificationItem({ n, t }: { n: AppNotification; t: TFunction }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 transition-all duration-300 hover:bg-background ${
      !n.read ? 'bg-accent/[0.08] border-l-2 border-l-accent' : 'border-l-2 border-l-transparent'
    }`}>
      {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
      {n.read  && <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />}

      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${TYPE_COLOR[n.type]}`}>
        {TYPE_ICON[n.type]}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-xs leading-relaxed ${!n.read ? 'font-medium text-text' : 'text-secondary'}`}>
          {n.message}
        </p>
        <p className="mt-0.5 text-[11px] text-muted">{timeAgo(n.createdAt, t)}</p>
      </div>
    </div>
  )
}

export function NotificationPopover() {
  const { t } = useTranslation()
  const [open, setOpen]         = useState(false)
  const ref                     = useRef<HTMLDivElement>(null)
  const notifications           = useNotificationStore((s) => s.notifications)
  const markAllRead             = useNotificationStore((s) => s.markAllRead)
  const unreadCount             = notifications.filter((n) => !n.read).length
  const preview                 = notifications.slice(0, 5)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleOpen() {
    setOpen((v) => !v)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <div className="relative">
          <Bell className="h-3.5 w-3.5" />
          {unreadCount > 0 && (
            <span
              key={unreadCount}
              className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-bold text-white animate-badge-pop"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {t('account.notifications.title')}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-secondary/15 bg-surface shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-secondary/10 px-4 py-3">
            <span className="text-sm font-semibold text-text">{t('account.notifications.title')}</span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-secondary hover:text-primary transition-colors"
              >
                {t('account.notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* List */}
          {preview.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Bell className="h-8 w-8 text-muted" />
              <p className="text-xs text-secondary">{t('account.notifications.empty')}</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary/8 max-h-80 overflow-y-auto">
              {preview.map((n) => (
                <NotificationItem key={n.id} n={n} t={t} />
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-secondary/10 px-4 py-2.5">
              <Link
                to="/account/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t('account.notifications.viewAll')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
