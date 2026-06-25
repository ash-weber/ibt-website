'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  apiClient,
  type PaginationMeta,
  type PublicTestimonial,
} from '@/src/api/client';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Loader } from '@/src/shared/ui';
import { motion, AnimatePresence } from 'framer-motion';

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [testimonialsMeta, setTestimonialsMeta] = useState<PaginationMeta>({
    page: 1, limit: 3, totalPages: 1, totalItems: 0,
  });
  const [testimonialsPage, setTestimonialsPage] = useState(1);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);

  const testimonialsLoadingRef = useRef(false);

  const loadTestimonialsPage = useCallback(
    async (page: number) => {
      if (testimonialsLoadingRef.current) return;
      testimonialsLoadingRef.current = true;
      setTestimonialsLoading(true);
      setTestimonialsError(null);

      try {
        const result = await apiClient.getTestimonials(page, 3);
        setTestimonials(result.items ?? []);
        setTestimonialsMeta(
          result.meta ?? { page: 1, limit: 3, totalPages: 1, totalItems: 0 }
        );
        setTestimonialsPage(page);
      } catch (err) {
        setTestimonialsError(
          err instanceof Error ? err.message : 'Failed to load testimonials'
        );
      } finally {
        testimonialsLoadingRef.current = false;
        setTestimonialsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadTestimonialsPage(1);
  }, [loadTestimonialsPage]);

  const hasTestimonials = useMemo(
    () => testimonials.length > 0,
    [testimonials]
  );

  const testimonialsTotalPages = Math.max(1, testimonialsMeta.totalPages ?? 1);
  const canGoPrevTestimonials = testimonialsPage > 1;
  const canGoNextTestimonials = testimonialsPage < testimonialsTotalPages;

  // Fallback data if no API data is available
  const fallbackTestimonials = [
    {
      id: '1',
      name: 'Deva',
      role: 'CEO',
      company: 'Journey Analytics',
      content: 'IBT delivered a highly responsive and user-friendly platform. Their attention to detail and commitment to quality made the entire process smooth.',
      avatarUrl: null,
    },
    {
      id: '2',
      name: 'Surya',
      role: 'CTO',
      company: 'TechCoach',
      content: 'Working with the IBT team was a great experience. They understood our requirements perfectly and delivered beyond expectations.',
      avatarUrl: null,
    },
    {
      id: '3',
      name: 'Manoj',
      role: 'Founder',
      company: 'MultipliersKart',
      content: "Professional, reliable and innovative - that's what defines IBT. We highly recommend their services.",
      avatarUrl: null,
    }
  ];

  const displayTestimonials = hasTestimonials ? testimonials : fallbackTestimonials;
  const isLoading = testimonialsLoading && !hasTestimonials;

  return (
    <section className="bg-slate-50 py-12 lg:py-16 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h3 className="text-[18px] font-bold uppercase tracking-widest !text-red-500 mb-3">
              TESTIMONIALS
            </h3>
            <h2 className="font-bold text-slate-900">
              What Our Clients Say
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3 mt-6 md:mt-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => void loadTestimonialsPage(testimonialsPage - 1)}
              disabled={!canGoPrevTestimonials || testimonialsLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40"
            >
              <FiChevronLeft className="text-lg" />
            </button>
            <button
              type="button"
              onClick={() => void loadTestimonialsPage(testimonialsPage + 1)}
              disabled={!canGoNextTestimonials || testimonialsLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="lg" label="Loading Testimonials..." />
          </div>
        ) : (
          <div className="relative">

            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialsPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {displayTestimonials.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col bg-white rounded-2xl p-8 border border-slate-100 shadow-sm"
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-6 text-yellow-400">
                      {'★★★★★'.split('').map((star, i) => (
                        <span key={i} className="text-lg">{star}</span>
                      ))}
                    </div>

                    {/* Text */}
                    <div
                      className="text-[15px] leading-relaxed text-slate-600 mb-8 flex-grow"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />

                    {/* User Info */}
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          item.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {[item.role, item.company].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

      </div>
    </section>
  );
}