import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const font = '"Times New Roman",Times,serif';

/**
 * Pagination bar for tables.
 * Props: page (0-indexed), totalPages, totalElements, pageSize, onPageChange
 */
export default function Pagination({ page, totalPages, totalElements, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{ borderTop: '1px solid rgba(108,63,197,0.15)' }}
    >
      <p className="text-slate-400 text-xs" style={{ fontFamily: font }}>
        Showing {from}–{to} of {totalElements}
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
          aria-label="Previous page"
        >
          <FiChevronLeft size={16} />
        </button>

        {/* Page number pills */}
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className="w-7 h-7 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: p === page ? '#6C3FC5' : 'transparent',
                color: p === page ? '#fff' : '#64748b',
                fontFamily: font,
              }}
            >
              {p + 1}
            </button>
          );
        })}

        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
          aria-label="Next page"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
