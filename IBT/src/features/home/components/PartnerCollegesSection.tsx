'use client';

import { useEffect, useRef, useState } from 'react';
import {
  apiClient,
  type PublicPartnerCollege,
} from '@/src/api/client';
import { motion } from 'framer-motion';
import { FiBookOpen } from 'react-icons/fi';

function CollegeMarqueeCard({
  item,
}: {
  item: PublicPartnerCollege;
}) {
  const content = (
    <div className="group flex h-[100px] w-[220px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-500 hover:border-blue-100 hover:shadow-xl hover:-translate-y-1.5">
      <div className="flex h-full w-full items-center justify-center">
        {item.logoUrl ? (
          <img
            src={item.logoUrl}
            alt={item.name}
            className="max-h-14 max-w-[92%] object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 text-center">
            <span className="text-sm font-bold tracking-tight text-[#1e293b] transition-colors duration-300 group-hover:text-blue-600 line-clamp-1">
              {item.name}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Institution
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (item.website) {
    return (
      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0 outline-none"
      >
        {content}
      </a>
    );
  }

  return <div className="shrink-0">{content}</div>;
}

function CollegeInfiniteMarquee({
  items,
  direction = 'right',
  speed = 40
}: {
  items: any[];
  direction?: 'left' | 'right';
  speed?: number;
}) {
  if (!items || items.length === 0) return null;

  const multipliedItems = items.length < 8
    ? [...items, ...items, ...items, ...items]
    : [...items, ...items];

  return (
    <div className="relative flex w-full overflow-hidden py-4">
      {/* Edge fading masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 sm:w-36 bg-gradient-to-r from-slate-50 to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 sm:w-36 bg-gradient-to-l from-slate-50 to-transparent"></div>

      <motion.div
        className="flex w-max gap-8 pr-8"
        animate={{
          x: direction === 'left' ? [0, '-50%'] : ['-50%', 0],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: speed,
        }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {multipliedItems.map((item, i) => (
          <CollegeMarqueeCard key={`${item.id}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

export function PartnerCollegesSection() {
  const [colleges, setColleges] = useState<PublicPartnerCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    async function loadColleges() {
      try {
        const result = await apiClient.getPartnerColleges(1, 50);
        setColleges(result.items ?? []);
      } catch (err) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    }

    void loadColleges();
  }, []);

  const fallbackColleges = [
    { id: 'fc1', name: 'Harvard University', website: 'https://www.harvard.edu' },
    { id: 'fc2', name: 'Stanford University', website: 'https://www.stanford.edu' },
    { id: 'fc3', name: 'Massachusetts Institute of Technology', website: 'https://www.mit.edu' },
    { id: 'fc4', name: 'University of Cambridge', website: 'https://www.cam.ac.uk' },
    { id: 'fc5', name: 'University of Oxford', website: 'https://www.ox.ac.uk' },
    { id: 'fc6', name: 'UC Berkeley', website: 'https://www.berkeley.edu' },
  ];

  const displayColleges = colleges.length > 0 ? colleges : fallbackColleges;

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-16 lg:py-20 border-t border-slate-100">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl text-left">
            <h2 className='text-[18px] !text-red-500'>ACADEMIC PARTNERSHIPS</h2>
            <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight sm:text-4xl pt-2">
              Our Partner Colleges & Universities
            </h2>

          </div>

        </div>

        {/* Marquee Wrapper */}
        <div className="w-full relative rounded-3xl bg-slate-50/50 p-3 sm:p-6 border border-slate-100">
          <CollegeInfiniteMarquee items={displayColleges} direction="right" speed={40} />
        </div>

      </div>
    </section>
  );
}
