import {
  LandingPage, 
  SolutionsSection,
  WhyChooseUsSection,
  HowWeWorkSection,
  RecentWorkSection,
  StatsDarkSection,
  PartnersClientsSection, 
  PartnerCollegesSection,
  TestimonialsSection, 
  CTASection
} from '@/src/features/home/components';

export default function Home() {
  return (
    <>
      <LandingPage />
      <SolutionsSection />
      <WhyChooseUsSection />
      <HowWeWorkSection />
      <RecentWorkSection />
      <StatsDarkSection />
      <PartnersClientsSection />
      <PartnerCollegesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
