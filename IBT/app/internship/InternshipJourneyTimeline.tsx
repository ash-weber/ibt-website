'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export function InternshipJourneyTimeline({ children }: { children: React.ReactNode }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (timelineRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scrollLeft = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Navigation Arrows for Mobile/Tablet */}
      <div className="flex justify-end items-center gap-2 lg:hidden mb-6 px-4">
        <button 
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={`w-10 h-10 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center transition-all ${
            !canScrollLeft 
              ? 'opacity-30 cursor-not-allowed text-slate-300' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FiChevronLeft size={20} />
        </button>
        <button 
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={`w-10 h-10 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center transition-all ${
            !canScrollRight 
              ? 'opacity-30 cursor-not-allowed text-slate-300' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Horizontal Line for Desktop */}
      <div className="hidden lg:block absolute top-[64px] left-[10%] right-[10%] h-[2px] bg-slate-100 z-0 border-t-2 border-dashed border-slate-200" />

      <div 
        ref={timelineRef}
        onScroll={checkScroll}
        className="flex lg:grid lg:grid-cols-5 gap-6 sm:gap-10 overflow-x-auto snap-x snap-mandatory lg:overflow-visible pb-6 custom-scrollbar px-4 lg:px-0 -mx-4 lg:mx-0"
      >
        {children}
      </div>
    </div>
  );
}
