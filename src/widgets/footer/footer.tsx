import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  const LINK_GROUPS = [
    {
      titleKey: 'footer.company',
      links: [
        { labelKey: 'footer.aboutUs', to: '/' },
        { labelKey: 'footer.careers', to: '/' },
        { labelKey: 'footer.press', to: '/' },
      ],
    },
    {
      titleKey: 'footer.support',
      links: [
        { labelKey: 'footer.helpCenter', to: '/' },
        { labelKey: 'footer.contactUs', to: '/' },
        { labelKey: 'footer.returns', to: '/' },
      ],
    },
    {
      titleKey: 'footer.legal',
      links: [
        { labelKey: 'footer.privacyPolicy', to: '/' },
        { labelKey: 'footer.termsOfService', to: '/' },
        { labelKey: 'footer.cookiePolicy', to: '/' },
      ],
    },
  ]

  return (
    <footer className="bg-primary-dark text-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-bold text-white">
              Ecommerce
            </Link>
            <p className="mt-3 text-sm text-white/70">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Link groups */}
          {LINK_GROUPS.map((group) => (
            <div key={group.titleKey}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
                {t(group.titleKey)}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  )
}
