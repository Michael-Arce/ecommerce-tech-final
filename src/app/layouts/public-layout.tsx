import { Outlet } from '@tanstack/react-router'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { ChatWidget } from '@/features/ai-assistant'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
