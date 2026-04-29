import { useEffect } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { RegisterForm } from '@/features/authenticate'
import { useAuthStore } from '@/features/authenticate'

export function RegisterPage() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { returnUrl?: string }
  const returnUrl = search.returnUrl ?? '/'

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: returnUrl })
    }
  }, [isAuthenticated, navigate, returnUrl])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">{t('auth.register.title')}</h1>
        <p className="mt-1 text-sm text-secondary">{t('auth.register.subtitle')}</p>
      </div>

      <RegisterForm onSuccess={() => void navigate({ to: returnUrl })} />

      <p className="mt-6 text-center text-sm text-secondary">
        {t('auth.register.alreadyHaveAccount')}{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          {t('auth.register.signIn')}
        </Link>
      </p>
    </div>
  )
}
