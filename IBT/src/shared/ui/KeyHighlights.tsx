import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { generateKeyHighlights } from '@/src/utils/highlights';

export interface KeyHighlightsProps {
  title?: string;
  description?: string | null;
  cardTitle?: string | null;
  tags?: string[] | null;
  features?: string[] | null;
  className?: string;
}

export function KeyHighlights({
  title = 'KEY HIGHLIGHTS & FEATURES',
  description,
  cardTitle,
  tags,
  features,
  className = '',
}: KeyHighlightsProps) {
  const items = generateKeyHighlights(description, cardTitle, tags, features);

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 sm:text-base">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {items.map((feat, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-100/90 shadow-2xs hover:border-emerald-200 transition-colors min-w-0"
          >
            <FiCheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm font-bold text-slate-800 break-words whitespace-normal leading-snug" title={feat}>
              {feat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
