import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const AddressesPage = lazy(() => import('@/pages/account/addresses-page').then((m) => ({ default: m.AddressesPage })))

export const Route = createFileRoute('/account/addresses')({
  component: AddressesPage,
})
