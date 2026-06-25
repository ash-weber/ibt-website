import { useEffect, useRef, useState } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { cx } from '../utils/cx'
import { Loader } from './Loader'

type SearchBoxProps = {
  placeholder?: string
  debounceMs?: number
  minChars?: number
  defaultValue?: string
  className?: string
  onSearch: (value: string) => void | Promise<void>
}

export function SearchBox({
  placeholder = 'Search...',
  debounceMs = 350,
  minChars = 0,
  defaultValue = '',
  className,
  onSearch,
}: SearchBoxProps) {
  const [query, setQuery] = useState(defaultValue)
  const [isSearching, setIsSearching] = useState(false)
  const searchRequestRef = useRef(0)
  const debouncedQuery = useDebouncedValue(query, debounceMs)

  // Sync external defaultValue changes to internal query state
  useEffect(() => {
    setQuery(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    const normalized = debouncedQuery.trim()

    if (normalized.length < minChars) {
      setIsSearching(false)
      void onSearch('')
      return
    }

    const currentRequest = ++searchRequestRef.current
    setIsSearching(true)

    Promise.resolve(onSearch(normalized)).finally(() => {
      if (currentRequest === searchRequestRef.current) {
        setIsSearching(false)
      }
    })
  }, [debouncedQuery, minChars, onSearch])

  return (
    <div className={cx('relative', className)}>
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ui-muted)]" />
      <input
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(event) => setQuery(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-[var(--ui-border)] bg-white pl-9 pr-10 text-sm text-[var(--ui-text)] outline-none transition-colors focus:border-[var(--ui-primary)] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        aria-label={placeholder}
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        {isSearching ? (
          <Loader size={16} label="Searching" />
        ) : query ? (
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--ui-muted)] hover:bg-[var(--ui-surface-muted)]"
            aria-label="Clear search"
            onClick={() => setQuery('')}
          >
            <FiX size={14} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
