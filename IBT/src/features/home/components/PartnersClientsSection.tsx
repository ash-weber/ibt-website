'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  apiClient,
  type PublicClient,
  type PublicPartner,
} from '@/src/api/client';
import { Loader } from '@/src/shared/ui';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function MarqueeCard({
  item,
}: {
  item: { id: string; name: string; logoUrl?: string | null; website?: string | null };
}) {
  const content = (
    <div className="group flex h-[90px] w-[200px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex h-full w-full items-center justify-center">
        {item.logoUrl ? (
          <img
            src={item.logoUrl}
            alt={item.name}
            className="max-h-12 max-w-[90%] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-center text-lg font-black text-[#0f172a] transition-colors duration-300 group-hover:text-blue-600 line-clamp-1">
            {item.name}
          </span>
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

function InfiniteMarquee({
  items,
  direction = 'left',
  speed = 5
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
    <div className="relative flex w-full overflow-hidden py-6">
      {/* Gradient masks for smooth fade out at edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent"></div>

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
          <MarqueeCard key={`${item.id}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

export function PartnersClientsSection() {
  const [partners, setPartners] = useState<PublicPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);

  const [clients, setClients] = useState<PublicClient[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    async function loadData() {
      try {
        const [partnersResult, clientsResult] = await Promise.all([
          apiClient.getPartners(1, 50),
          apiClient.getClients(1, 50)
        ]);

        setPartners(partnersResult.items ?? []);
        setClients(clientsResult.items ?? []);
      } catch (err) {
        // Handle error silently for layout
      } finally {
        setPartnersLoading(false);
        setClientsLoading(false);
      }
    }

    void loadData();
  }, []);

  const combinedItems = [...partners, ...clients];
  const hasItems = combinedItems.length > 0;

  // Fallback items matching the design if API has no items
  const fallbackItems = [
    { id: '1', name: 'Journey Analytics' },
    { id: '2', name: 'TechCoach' },
    { id: '3', name: 'Octosignals' },
    { id: '4', name: 'MultipliersKart' },
    { id: '5', name: 'FIM' },
    { id: '6', name: 'X-Mind' },
  ];

  const displayItems = hasItems ? combinedItems : fallbackItems;

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 text-left">
          <h3 className="text-[18px] font-bold uppercase tracking-widest !text-red-500 mb-3">
            OUR PARTNERS & CLIENTS
          </h3>
          <h2 className="font-bold text-[#0f172a] tracking-tight">
            Trusted By Amazing Companies
          </h2>
        </div>

        {/* Marquee */}
        <div className="w-full relative">
          <InfiniteMarquee items={displayItems} direction="left" speed={40} />
        </div>

      </div>
    </section>
  );
}