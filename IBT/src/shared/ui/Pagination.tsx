import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi';
import { cx } from '@/src/utils/cx';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

function getPageNumbers(current: number, total: number) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function Pagination({ currentPage, totalPages, onPageChange, disabled, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className={cx('flex flex-wrap items-center justify-center gap-2', className)}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || disabled}
        className="inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-xl border border-(--ui-border) bg-white text-(--ui-text) transition-all duration-300 hover:bg-(--ui-surface-muted) hover:text-(--ui-primary) hover:border-(--ui-primary-soft) disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <FiChevronLeft className="text-xl" />
      </button>

      <div className="flex items-center gap-1.5 px-2">
        {pages.map((p, index) => {
          if (p === '...') {
            return (
              <div key={`ellipsis-${index}`} className="flex h-10 w-8 items-center justify-center text-(--ui-muted)">
                <FiMoreHorizontal />
              </div>
            );
          }

          const pageNumber = p as number;
          const isCurrent = pageNumber === currentPage;

          return (
            <button
              key={`page-${pageNumber}`}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              disabled={disabled}
              aria-current={isCurrent ? 'page' : undefined}
              className={cx(
                'inline-flex cursor-pointer h-10 min-w-10 items-center justify-center px-3 rounded-xl text-sm font-semibold transition-all duration-300',
                isCurrent
                  ? 'bg-(--ui-primary) text-white shadow-md shadow-(--ui-primary)/25 scale-105'
                  : 'bg-white text-(--ui-muted) hover:bg-(--ui-surface-muted) hover:text-(--ui-primary)',
              )}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || disabled}
        className="inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-xl border border-(--ui-border) bg-white text-(--ui-text) transition-all duration-300 hover:bg-(--ui-surface-muted) hover:text-(--ui-primary) hover:border-(--ui-primary-soft) disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <FiChevronRight className="text-xl" />
      </button>
    </div>
  );
}