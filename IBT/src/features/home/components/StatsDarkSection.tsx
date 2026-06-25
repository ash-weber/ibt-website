'use client';

import { motion } from 'framer-motion';
import { FiTarget, FiUsers, FiAward, FiBook } from 'react-icons/fi';

const stats = [
  {
    id: 1,
    value: '250+',
    label: 'Projects Delivered',
    icon: <FiTarget className="w-8 h-8 text-white opacity-80" />
  },
  {
    id: 2,
    value: '200+',
    label: 'Happy Clients',
    icon: <FiUsers className="w-8 h-8 text-white opacity-80" />
  },
  {
    id: 3,
    value: '50+',
    label: 'International Clients',
    icon: <FiBook className="w-8 h-8 text-white opacity-80" />
  },
  {
    id: 4,
    value: '10+',
    label: 'Years Experience',
    icon: <FiAward className="w-8 h-8 text-white opacity-80" />
  }
];

export function StatsDarkSection() {
  return (
    <section className="bg-slate-900 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 divide-x divide-slate-700/0 md:divide-slate-700/50">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-center gap-4"
            >
              <div className="flex-shrink-0">
                {stat.icon}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-3xl font-bold text-white leading-none mb-1">
                  {stat.value}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
