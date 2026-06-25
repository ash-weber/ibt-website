'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { apiClient, type PublicContact } from '@/src/api/client';

const links = [
  {
    title: 'Product',
    items: [
      { label: 'Services', href: '/services' },
      { label: 'IBT Labs', href: '/ibt-labs' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  // {
  //   title: 'Legal',
  //   items: [
  //     { label: 'Privacy', href: '#' },
  //     { label: 'Terms', href: '#' },
  //     { label: 'Sitemap', href: '#' },
  //   ],
  // },
];



const iconMap = {
  PHONE: FiPhone,
  EMAIL: FiMail,
  ADDRESS: FiMapPin,
};

const labelMap = {
  PHONE: 'Phone',
  EMAIL: 'Email',
  ADDRESS: 'Address',
};

export { SiteFooter } from '@/src/features/layout/components/SiteFooter'