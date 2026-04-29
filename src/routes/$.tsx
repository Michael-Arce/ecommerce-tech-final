import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const NotFoundPage = lazy(() => import('@/pages/system/not-found-page').then((m) => ({ default: m.NotFoundPage })))

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
})
