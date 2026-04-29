import { useNavigate, useSearch as useRouterSearch } from '@tanstack/react-router'

export function useSearch() {
  const navigate = useNavigate()
  const search = useRouterSearch({ strict: false }) as { q?: string }
  const currentQ = search.q ?? ''

  function searchProducts(term: string) {
    if (term) {
      void navigate({ to: '/search', search: { q: term } })
    } else {
      void navigate({ to: '/' })
    }
  }

  return { currentQ, search: searchProducts }
}
