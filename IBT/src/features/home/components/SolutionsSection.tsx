'use client';

import { motion } from 'framer-motion';
import { FiMonitor, FiSmartphone, FiCpu, FiDatabase, FiAward, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

const services = [
  {
    id: 1,
    title: 'Web Development',
    description: 'Modern, responsive web applications built with latest technologies.',
    icon: <FiMonitor className="w-6 h-6 text-blue-600" />,
    color: 'bg-blue-50/50',
    textColor: 'text-blue-600',
    link: '/services/web-development'
  },
  {
    id: 2,
    title: 'Mobile App Development',
    description: 'Custom mobile apps for Android & iOS that deliver great user experiences.',
    icon: <FiSmartphone className="w-6 h-6 text-red-500" />,
    color: 'bg-red-50/50',
    textColor: 'text-red-500',
    link: '/services/mobile-development'
  },
  {
    id: 3,
    title: 'AI Solutions',
    description: 'AI-powered solutions to automate, analyze and accelerate your business.',
    icon: <FiCpu className="w-6 h-6 text-green-500" />,
    color: 'bg-green-50/50',
    textColor: 'text-green-500',
    link: '/services/ai-solutions'
  },
  {
    id: 4,
    title: 'ERP Systems',
    description: 'Powerful ERP systems to streamline your operations and improve efficiency.',
    icon: <FiDatabase className="w-6 h-6 text-purple-600" />,
    color: 'bg-purple-50/50',
    textColor: 'text-purple-600',
    link: '/services/erp-systems'
  },
  {
    id: 5,
    title: 'Internships',
    description: 'Industry-oriented internship programs with real-world experience.',
    icon: <FiAward className="w-6 h-6 text-orange-500" />,
    color: 'bg-orange-50/50',
    textColor: 'text-orange-500',
    link: '/internships'
  },
  {
    id: 6,
    title: 'Training & Courses',
    description: 'Practical training programs to build in-demand tech skills.',
    icon: <FiBookOpen className="w-6 h-6 text-blue-500" />,
    color: 'bg-blue-50/50',
    textColor: 'text-blue-500',
    link: '/courses'
  }
];

export function SolutionsSection() {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h3 className="text-[18px] font-bold uppercase tracking-widest !text-red-500 mb-3">
              OUR SERVICES
            </h3>
            <h2 className="font-black tracking-tight text-[#0f172a] text-[28px] sm:text-[36px]">
              Solutions That Drive Growth
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              href="/services" 
              className="inline-flex items-center text-md font-bold text-[#e63946] hover:text-[#d62839] transition-colors"
            >
              View All Services <FiArrowRight className="ml-1.5" />
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-2xl border border-slate-100 bg-white p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className={`w-12 h-12 rounded-full ${service.color} flex items-center justify-center mb-6`}>
                {service.icon}
              </div>

              <h4 className="text-[15px] font-extrabold text-[#0f172a] mb-3 leading-snug">
                {service.title}
              </h4>

              <p className="text-[13px] text-slate-500 flex-grow leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
