import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LoginForm } from '@/features/authenticate'
import { useAuthStore } from '@/features/authenticate'

const DEMO_CREDENTIALS = [
  { labelKey: 'auth.login.demoCustomer', email: 'sofia.martin@gmail.com', password: 'password123' },
  { labelKey: 'auth.login.demoAdmin', email: 'admin@premiumtech.com', password: 'password123' },
] as const

type Prefill = { email: string; password: string }

export function LoginPage() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' }) as { returnUrl?: string }
  const returnUrl = search.returnUrl ?? '/'
  const [prefill, setPrefill] = useState<Prefill | undefined>()

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: returnUrl })
    }
  }, [isAuthenticated, navigate, returnUrl])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">{t('auth.login.title')}</h1>
        <p className="mt-1 text-sm text-secondary">{t('auth.login.subtitle')}</p>
      </div>

      {/* Demo credentials */}
      <div className="mb-6 rounded-xl border border-secondary/20 bg-background p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
          {t('auth.login.demoAccounts')}
        </p>
        <div className="flex flex-col gap-1.5">
          {DEMO_CREDENTIALS.map((cred) => (
            <button
              key={cred.email}
              type="button"
              onClick={() => setPrefill({ email: cred.email, password: cred.password })}
              className="flex items-center justify-between rounded-lg border border-secondary/15 bg-surface px-3 py-2 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div>
                <span className="text-xs font-semibold text-text">{t(cred.labelKey)}</span>
                <p className="text-xs text-secondary">{cred.email}</p>
              </div>
              <span className="text-[10px] text-muted">{t('auth.login.clickToFill')}</span>
            </button>
          ))}
        </div>
      </div>

      <LoginForm
        prefill={prefill}
        onSuccess={() => void navigate({ to: returnUrl })}
      />

      <p className="mt-6 text-center text-sm text-secondary">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          {t('auth.login.createOne')}
        </Link>
      </p>
    </div>
  )
}
