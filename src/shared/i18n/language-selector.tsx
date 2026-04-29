import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

interface LanguageSelectorProps {
  variant?: 'dark' | 'light'
}

export function LanguageSelector({ variant = 'dark' }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation()
  const current = i18n.language.startsWith('es') ? 'es' : 'en'

  function toggle() {
    i18n.changeLanguage(current === 'en' ? 'es' : 'en')
  }

  const className = variant === 'light'
    ? 'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-secondary transition-colors hover:bg-background hover:text-text'
    : 'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white'

  return (
    <button
      onClick={toggle}
      className={className}
      title={t('language.select')}
    >
      <Globe className="h-3.5 w-3.5" />
      {current === 'en' ? t('language.es') : t('language.en')}
    </button>
  )
}
