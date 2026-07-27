import { Metadata } from 'next';
import { AllProductsPage } from '@/src/features/products/components';

export const metadata: Metadata = {
  title: 'I-BACUS TECH SOLUTIONS PRIVATE LIMITED',
  description: 'Turning Ideas Into Real Digital Products - Scalable web applications, mobile apps, AI solutions and enterprise software.',
};

export default function ProductsPage() {
  return <AllProductsPage />;
}
