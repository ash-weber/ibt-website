'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFileText, FiLayout, FiCode, FiCheckSquare, FiSend, FiLifeBuoy, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const steps = [
  {
    id: '01',
    title: 'Discovery',
    description: 'Understanding your business and goals',
    icon: <FiSearch className="w-6 h-6 text-blue-600" />,
    textColor: 'text-blue-600',
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-50/70',
  },
  {
    id: '02',
    title: 'Planning',
    description: 'Strategy, requirements and roadmap',
    icon: <FiFileText className="w-6 h-6 text-rose-500" />,
    textColor: 'text-rose-500',
    borderColor: 'border-rose-400',
    bgColor: 'bg-rose-50/70',
  },
  {
    id: '03',
    title: 'Design',
    description: 'UI/UX design and prototyping',
    icon: <FiLayout className="w-6 h-6 text-emerald-500" />,
    textColor: 'text-emerald-500',
    borderColor: 'border-emerald-400',
    bgColor: 'bg-emerald-50/70',
  },
  {
    id: '04',
    title: 'Development',
    description: 'Building with clean and scalable code',
    icon: <FiCode className="w-6 h-6 text-purple-500" />,
    textColor: 'text-purple-500',
    borderColor: 'border-purple-400',
    bgColor: 'bg-purple-50/70',
  },
  {
    id: '05',
    title: 'Testing',
    description: 'Quality testing for bug-free delivery',
    icon: <FiCheckSquare className="w-6 h-6 text-orange-500" />,
    textColor: 'text-orange-500',
    borderColor: 'border-orange-400',
    bgColor: 'bg-orange-50/70',
  },
  {
    id: '06',
    title: 'Deployment',
    description: 'Launching and going live',
    icon: <FiSend className="w-6 h-6 text-indigo-500" />,
    textColor: 'text-indigo-500',
    borderColor: 'border-indigo-400',
    bgColor: 'bg-indigo-50/70',
  },
  {
    id: '07',
    title: 'Support',
    description: 'Continuous support and maintenance',
    icon: <FiLifeBuoy className="w-6 h-6 text-teal-500" />,
    textColor: 'text-teal-500',
    borderColor: 'border-teal-400',
    bgColor: 'bg-teal-50/70',
  }
];

export function HowWeWorkSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth / 2; // scroll half the container
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-12 lg:py-16 overflow-hidden border-t border-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-bold uppercase tracking-widest !text-red-500 mb-2 md:mb-3">
              OUR PROCESS
            </h3>
            <h2 className="font-black tracking-tight text-[#0f172a] text-2xl md:text-4xl">
              How We Work
            </h2>
          </div>
          
          {/* Navigation Buttons (Moved Above Content) */}
          <div className="flex items-center gap-2 xl:hidden shrink-0 pb-1 self-end md:self-auto">
            <button 
              onClick={() => scroll('left')}
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
              onClick={() => scroll('right')}
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
        </div>

        {/* Timeline Carousel Area */}
        <div className="relative">

          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory"
          >
            <div className="flex min-w-max xl:grid xl:grid-cols-7 gap-6 px-4 md:px-0">
              {/* Connecting Line (Desktop only) */}
              <div className="hidden xl:block absolute top-[32px] left-[7%] right-[7%] h-[2px] border-t-2 border-dashed border-slate-200 -z-0"></div>

              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-[200px] xl:w-auto flex flex-col items-center relative z-10 snap-start shrink-0"
                >
                  {/* Icon Node */}
                  <div className="mb-6 flex justify-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm border border-slate-100 ${step.bgColor}`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Step Content with Top Colored Bar */}
                  <div className="mt-1 flex flex-col items-center text-center xl:px-2 w-full">
                    <div className={`text-[11px] font-black ${step.textColor} mb-2`}>
                      {step.id}
                    </div>
                    <div className={`border-t-2 ${step.borderColor} pt-3 w-full h-[90px] flex flex-col items-center`}>
                      <h4 className="text-[14px] font-extrabold text-[#0f172a] mb-1.5 leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-[140px] text-center">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
