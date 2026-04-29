import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/shared/ui'
import { useSearch } from '../model/use-search'

interface SearchBarProps {
  onSearch?: () => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const { t } = useTranslation()
  const { currentQ, search } = useSearch()
  const [value, setValue] = useState(currentQ)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFocusedRef = useRef(false)

  useEffect(() => {
    if (!isFocusedRef.current) setValue(currentQ)
  }, [currentQ])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const term = e.target.value
    setValue(term)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      search(term.trim())
      if (term.trim()) onSearch?.()
    }, 300)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (timerRef.current) clearTimeout(timerRef.current)
    if (value.trim()) {
      search(value.trim())
      onSearch?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full">
      <Input
        type="search"
        placeholder={t('header.searchPlaceholder')}
        value={value}
        onChange={handleChange}
        aria-label={t('header.searchPlaceholder')}
        onFocus={() => { isFocusedRef.current = true }}
        onBlur={() => { isFocusedRef.current = false }}
        className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <button
        type="submit"
        aria-label={t('header.searchPlaceholder')}
        className="flex shrink-0 items-center justify-center rounded-r-md bg-accent px-4 text-white transition-colors hover:bg-accent-dark"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}
