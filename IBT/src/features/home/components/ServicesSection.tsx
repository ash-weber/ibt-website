'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient, type PaginationMeta, type PublicService } from '@/src/api/client';
import { motion, Variants } from 'framer-motion';
import { FiBriefcase, FiCornerDownRight, FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { Loader, SiteButton } from '@/src/shared/ui';
import { resolveImageUrl } from '@/src/utils/image';

import { useSocketSettings } from '@/src/providers/SocketSettingsProvider';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardColors = [
  { bg: 'bg-blue-50', text: 'text-blue-600', iconColor: '#2563eb' },
  { bg: 'bg-rose-50', text: 'text-rose-500', iconColor: '#f43f5e' },
  { bg: 'bg-emerald-50', text: 'text-emerald-500', iconColor: '#10b981' },
  { bg: 'bg-purple-50', text: 'text-purple-600', iconColor: '#9333ea' },
  { bg: 'bg-orange-50', text: 'text-orange-500', iconColor: '#f97316' },
  { bg: 'bg-sky-50', text: 'text-sky-500', iconColor: '#0ea5e9' },
];

export function ServicesSection() {
  const { settings } = useSocketSettings();
  const badge = settings?.homeServicesBadge || 'OUR SERVICES';
  const title = settings?.homeServicesTitle || 'Solutions That Drive Growth';

  const [services, setServices] = useState<PublicService[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  const loadingRef = useRef(false);

  useEffect(() => {
    const updateVisible = () => {
      const w = window.innerWidth;
      if (w >= 1024) setVisibleCount(6);
      else if (w >= 768) setVisibleCount(3);
      else if (w >= 640) setVisibleCount(2);
      else setVisibleCount(1);
    };

    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  useEffect(() => {
    const n = services.length;
    const maxIndex = Math.max(0, n - visibleCount);
    setCarouselIndex((prev) => Math.min(prev, maxIndex));
  }, [visibleCount, services]);

  const showPrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const showNext = () => {
    setCarouselIndex((prev) => Math.min(services.length - visibleCount, prev + 1));
  };

  const loadServices = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      // Increased to 8 to allow more dynamic cards from admin panel
      const result = await apiClient.getServices(1, 8);
      setServices(result.items);
      setMeta(result.meta ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const hasMore = (meta.totalItems ?? 0) > 8 || (meta.totalPages ?? 0) > 1;

  const renderIcon = (idx: number, imageUrl?: string | null, hexColor?: string) => {
    if (imageUrl) {
      return (
        <img
          src={resolveImageUrl(imageUrl)}
          alt="Service Icon"
          className="w-7 h-7 object-contain"
        />
      );
    }

    // Fallback SVGs based on index
    const iconIndex = idx % 4;
    const color = hexColor || '#3f78e0';
    switch (iconIndex) {
      case 0:
        return (
          <svg viewBox="0 0 500 500" className="w-7 h-7">
            <circle cx="200" cy="200" r="100" stroke={color} strokeWidth="40" fill="none" />
            <line x1="270" y1="270" x2="400" y2="400" stroke={color} strokeWidth="45" strokeLinecap="round" />
          </svg>
        );
      case 1:
        return (
          <svg viewBox="0 0 500 500" className="w-7 h-7">
            <rect x="50" y="100" width="400" height="300" rx="40" stroke={color} strokeWidth="40" fill="none" />
            <line x1="50" y1="180" x2="450" y2="180" stroke={color} strokeWidth="40" />
          </svg>
        );
      case 2:
        return (
          <svg viewBox="0 0 500 500" className="w-7 h-7">
            <rect x="100" y="100" width="250" height="200" rx="30" stroke={color} strokeWidth="40" fill="none" />
            <rect x="180" y="180" width="250" height="200" rx="30" stroke={color} strokeWidth="40" fill="none" />
          </svg>
        );
      case 3:
        return (
          <svg viewBox="0 0 500 500" className="w-7 h-7">
            <path d="M100 300 L350 150 L350 450 Z" stroke={color} strokeWidth="40" fill="none" strokeLinejoin="round" />
            <circle cx="380" cy="220" r="30" fill={color} />
          </svg>
        );
      default:
        return <FiBriefcase className="w-7 h-7" style={{ color }} />;
    }
  };

  return (
    <section className="bg-[#FEFAF4] py-10 lg:py-14 relative overflow-hidden">
      {/* Decorative Dots Backdrop */}
      <div className="absolute top-1/4 -left-10 opacity-20 pointer-events-none hidden lg:block">
        <div className="grid grid-cols-5 gap-3">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#e63946]" />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-10 text-left">
          <h3 className="text-[18px] font-bold uppercase tracking-widest !text-red-500 mb-3">
            {badge}
          </h3>

          <h2 className="max-w-2xl font-extrabold text-[#0f172a] tracking-tight text-[36px] sm:text-[44px]">
            {title}
          </h2>
        </div>

        {loading && services.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader size="lg" label="Preparing services..." />
          </div>
        )}

        {!loading && error && services.length === 0 && (
          <div className="p-12 text-center text-red-600">
            {error}
          </div>
        )}

        {services.length > 0 && (
          <>
            <div className="relative">
              {services.length > visibleCount && (
                <>
                  {/* LEFT ARROW */}
                  <button
                    onClick={showPrev}
                    disabled={carouselIndex <= 0}
                    aria-label="Previous"
                    className={`hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-[#1d3557] ${
                      carouselIndex <= 0 
                        ? 'opacity-30 cursor-not-allowed text-slate-300' 
                        : 'hover:bg-slate-50'
                    }`}
                    style={{ left: -20 }}
                  >
                    <FiChevronLeft size={24} />
                  </button>

                  {/* RIGHT ARROW */}
                  <button
                    onClick={showNext}
                    disabled={carouselIndex >= services.length - visibleCount}
                    aria-label="Next"
                    className={`hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-[#1d3557] ${
                      carouselIndex >= services.length - visibleCount 
                        ? 'opacity-30 cursor-not-allowed text-slate-300' 
                        : 'hover:bg-slate-50'
                    }`}
                    style={{ right: -20 }}
                  >
                    <FiChevronRight size={24} />
                  </button>
                </>
              )}

              <div className="overflow-hidden -mx-4 px-4">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex transition-transform duration-500 ease-out py-4"
                  style={{
                    width: `${(services.length * 100) / visibleCount}%`,
                    transform: `translateX(-${(carouselIndex * 100) / services.length}%)`,
                  }}
                >
                  {services.map((service, idx) => {
                    const colorSet = cardColors[idx % cardColors.length];
                    return (
                      <div
                        key={service.id}
                        className="px-2 sm:px-3"
                        style={{ flex: `0 0 ${100 / services.length}%` }}
                      >
                        <Link href={`/services/${service.slug}`} className="group block h-full">
                          <motion.article
                            variants={itemVariants}
                            className="flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 text-left hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1"
                          >
                            {/* Boxed Icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colorSet.bg} ${colorSet.text}`}>
                              {renderIcon(idx, service.imageUrl, colorSet.iconColor)}
                            </div>

                            <h3 className="text-sm font-extrabold text-[#0f172a] mb-2 leading-tight pr-4">
                              {service.title}
                            </h3>

                            <p className="text-[11px] leading-relaxed text-slate-500 mb-6 flex-1 pr-2 line-clamp-4">
                              {service.description || "Customized solutions to optimize operations and accelerate your business."}
                            </p>

                            <div className={`mt-auto flex items-center gap-1.5 text-[11px] font-bold ${colorSet.text}`}>
                              Learn More <FiArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </motion.article>
                        </Link>
                      </div>
                    )
                  })}
                </motion.div>
              </div>
            </div>

            {hasMore && (
              <div className="mt-16 flex justify-center">
                <SiteButton
                  href="/services"
                  variant="secondary"
                  size="lg"
                  className="rounded-2xl border-slate-200"
                  rightIcon={<FiCornerDownRight />}
                >
                  View All Services
                </SiteButton>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}