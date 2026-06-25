'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient, type PaginationMeta, type PublicStat } from '@/src/api/client';
import { FiChevronLeft, FiChevronRight, FiUsers, FiCheckCircle, FiActivity, FiClock, FiBriefcase, FiAward, FiSmile, FiGlobe } from 'react-icons/fi';
import { Loader } from '@/src/shared/ui';
import { IconType } from 'react-icons';

const statIcons: Record<string, IconType> = {
  projects: FiCheckCircle,
  clients: FiUsers,
  rate: FiActivity,
  support: FiClock,
  default: FiActivity
};

function AnimatedStatCard({ item, isFloating }: { item: PublicStat; isFloating?: boolean }) {
  const [count, setCount] = useState(0);
  const [startAnimation, setStartAnimation] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const numericString = item.value.replace(/[^0-9.]/g, '');
  const target = parseFloat(numericString);
  const isNumber = !isNaN(target) && target > 0;

  useEffect(() => {
    if (!startAnimation || !isNumber) return;

    let current = 0;
    const steps = 40;
    const increment = target / steps;
    
    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      setCount(current);
    }, 40);

    return () => clearInterval(timer);
  }, [startAnimation, isNumber, target]);

  let displayValue = item.value;
  if (isNumber) {
    const displayCount = Number.isInteger(target) ? Math.round(count) : count.toFixed(1);
    displayValue = item.value.replace(numericString, displayCount.toString());
  }

  const label = item.label.toLowerCase();

  if (isFloating) {
    let colorClasses = {
      gradientBg: 'from-rose-500/10 to-rose-500/2',
      borderClass: 'border-rose-500/15',
      text: 'text-rose-600',
      icon: FiUsers
    };

    if (label.includes('project') && !label.includes('country')) {
      colorClasses = {
        gradientBg: 'from-blue-500/10 to-blue-500/2',
        borderClass: 'border-blue-500/15',
        text: 'text-blue-600',
        icon: FiBriefcase
      };
    } else if (label.includes('country') || label.includes('globe') || label.includes('intern')) {
      colorClasses = {
        gradientBg: 'from-emerald-500/10 to-emerald-500/2',
        borderClass: 'border-emerald-500/15',
        text: 'text-emerald-600',
        icon: FiGlobe
      };
    } else if (label.includes('satisfaction') || label.includes('rate') || label.includes('percent') || label.includes('value')) {
      colorClasses = {
        gradientBg: 'from-amber-500/10 to-amber-500/2',
        borderClass: 'border-amber-500/15',
        text: 'text-amber-600',
        icon: FiAward
      };
    }

    const FloatingIcon = colorClasses.icon;

    return (
      <article
        ref={cardRef}
        className="flex items-center gap-4 py-3 px-4 rounded-2xl w-full transition-all duration-300 hover:bg-slate-50/50 group/item"
      >
        <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center bg-gradient-to-br ${colorClasses.gradientBg} shadow-sm border ${colorClasses.borderClass} ${colorClasses.text} transition-transform duration-300 group-hover/item:scale-110`}>
          <FloatingIcon size={24} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[28px] md:text-[32px] font-black text-slate-900 leading-none mb-1 tracking-tight">
            {startAnimation || !isNumber ? displayValue : item.value.replace(numericString, '0')}
          </span>
          <span className="text-[13px] md:text-[14px] font-bold text-slate-500 leading-tight tracking-tight uppercase">{item.label}</span>
        </div>
      </article>
    );
  }

  const Icon = statIcons[Object.keys(statIcons).find(key => label.includes(key)) || 'default'];

  return (
    <article
      ref={cardRef}
      className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl flex flex-col gap-4 group"
    >
       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--ui-primary-soft)/10 group-hover:bg-(--ui-primary) group-hover:text-white transition-colors duration-300">
          <Icon className="h-6 w-6 text-(--ui-primary) group-hover:text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-black leading-none mb-1">
          {startAnimation || !isNumber ? displayValue : item.value.replace(numericString, '0')}
        </span>
        <span className="text-sm font-bold text-slate-500 leading-tight">{item.label}</span>
      </div>
    </article>
  );
}

export function HomeSections({ isFloating }: { isFloating?: boolean }) {
  const [stats, setStats] = useState<PublicStat[]>([]);
  const [statsMeta, setStatsMeta] = useState<PaginationMeta>({ page: 1, limit: 4, totalPages: 1, totalItems: 0 });
  const [statsPage, setStatsPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef(false);

  const loadStatsPage = useCallback(async (page: number) => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.getStats(page, 4);
      setStats(result.items);
      setStatsMeta(result.meta ?? {});
      setStatsPage(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      setError(message);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatsPage(1);
  }, [loadStatsPage]);

  const hasStats = useMemo(() => stats.length > 0, [stats]);
  const totalStatsPages = Math.max(1, statsMeta.totalPages ?? 1);
  const canGoPrevStats = statsPage > 1;
  const canGoNextStats = statsPage < totalStatsPages;
  const showPaginationControls = totalStatsPages > 1;

  const handlePrevStats = () => {
    if (!canGoPrevStats || loading) {
      return;
    }

    void loadStatsPage(statsPage - 1);
  };

  const handleNextStats = () => {
    if (!canGoNextStats || loading) {
      return;
    }

    void loadStatsPage(statsPage + 1);
  };

  if (isFloating) {
    return (
      <div className="w-full">
        <p className="text-center text-[12px] md:text-[13px] font-black uppercase tracking-[0.24em] text-slate-400 mb-5">
          Trusted by startups, SMEs & enterprises
        </p>
        <div className="w-full rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-md px-6 sm:px-10 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.05)] transition-all duration-300 hover:shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-100/80">
             {stats.map((item) => (
                <div key={item.id} className="flex justify-center first:lg:pl-0">
                  <AnimatedStatCard item={item} isFloating />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mx-auto w-full">
        <section className="bg-white p-8 shadow-sm rounded-3xl border border-slate-100">
          {!isFloating && (
            <div className="mb-8 flex flex-col items-center text-center">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-(--ui-primary)">Our Achievements</p>
              <h2 className="mt-2 font-black text-slate-900">Numbers That Tell Our Story</h2>
            </div>
          )}

          {loading && !hasStats && (
            <div className="flex min-h-36 items-center justify-center rounded-3xl border border-slate-100 bg-slate-50">
              <Loader size="md" label="Loading stats" />
            </div>
          )}

          {!loading && error && !hasStats && (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
              {error}
            </div>
          )}

          {hasStats && (
            <div className="flex items-center gap-4">
              {showPaginationControls && (
                <button
                  type="button"
                  onClick={handlePrevStats}
                  disabled={!canGoPrevStats || loading}
                  className="cursor-pointer inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous stats page"
                >
                  <FiChevronLeft className="text-2xl" />
                </button>
              )}

              <div className="grid flex-1 grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                  <AnimatedStatCard key={item.id} item={item} />
                ))}
              </div>

              {showPaginationControls && (
                <button
                  type="button"
                  onClick={handleNextStats}
                  disabled={!canGoNextStats || loading}
                  className="cursor-pointer inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next stats page"
                >
                  <FiChevronRight className="text-2xl" />
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}