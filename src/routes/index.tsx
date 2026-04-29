import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const HomePage = lazy(() => import('@/pages/home/home-page').then((m) => ({ default: m.HomePage })))

export const Route = createFileRoute('/')({
  component: HomePage,
})
