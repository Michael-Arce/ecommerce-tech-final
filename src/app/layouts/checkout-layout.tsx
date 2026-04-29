import { Outlet, Link } from '@tanstack/react-router'

const STEPS = ['Cart', 'Checkout', 'Confirmation'] as const

interface CheckoutLayoutProps {
  currentStep?: number
}

export function CheckoutLayout({ currentStep = 1 }: CheckoutLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-secondary/20 bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-lg font-bold text-primary">Ecommerce</Link>

          <ol className="flex items-center gap-2 text-sm">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                {i > 0 && <span className="text-secondary/50">›</span>}
                <span className={i + 1 === currentStep ? 'font-semibold text-primary' : 'text-secondary'}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
