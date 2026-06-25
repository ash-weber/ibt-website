import { useEffect } from 'react'
import { ActionButton } from './ActionButton'

type PaginationProps = {
  page: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
  onPageChange: (page: number) => void
}

function getPaginationRange(currentPage: number, totalPages: number) {
  const delta = 2
  const left = currentPage - delta
  const right = currentPage + delta + 1
  const range: (number | string)[] = []
  const rangeWithDots: (number | string)[] = []

  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || (i >= left && i < right)) {
      range.push(i)
    }
  }

  range.forEach((i) => {
    if (rangeWithDots.length === 0) {
      rangeWithDots.push(i)
    } else if (typeof i === 'number' && typeof rangeWithDots[rangeWithDots.length - 1] === 'number') {
      const lastItem = rangeWithDots[rangeWithDots.length - 1]
      if (typeof lastItem === 'number' && i - lastItem === 2) {
        rangeWithDots.push(lastItem + 1)
      } else if (i - (typeof lastItem === 'number' ? lastItem : 0) !== 1) {
        rangeWithDots.push('...')
      }
      rangeWithDots.push(i)
    }
  })

  return rangeWithDots
}

export function Pagination({ page, totalPages, hasPrev, hasNext, onPageChange }: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)

  useEffect(() => {
    if (page > safeTotalPages) {
      onPageChange(safeTotalPages)
      return
    }

    if (page < 1) {
      onPageChange(1)
    }
  }, [page, safeTotalPages, onPageChange])

  if (totalPages <= 1) {
    return null
  }

  const paginationRange = getPaginationRange(page, totalPages)

  return (
    <div className="flex items-center justify-end gap-2 border border-[var(--ui-border)] bg-white px-4 py-3 shadow-[var(--ui-shadow-sm)]">
      <ActionButton
        size="sm"
        intent="ghost"
        disabled={!hasPrev}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </ActionButton>

      <div className="flex items-center gap-1">
        {paginationRange.map((pageNum, idx) =>
          pageNum === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-[var(--ui-muted)]">
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum as number)}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-all ${
                pageNum === page
                  ? 'bg-[var(--ui-primary)] text-white shadow-[var(--ui-shadow-sm)]'
                  : 'border border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]'
              }`}
            >
              {pageNum}
            </button>
          )
        )}
      </div>

      <ActionButton
        size="sm"
        intent="ghost"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </ActionButton>
    </div>
  )
}
