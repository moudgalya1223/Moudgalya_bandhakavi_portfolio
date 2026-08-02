'use client';

import { useState } from 'react';
import Navbar from '@/components/public/Navbar';
import HeroSection from '@/components/public/HeroSection';
import TechMatrix from '@/components/public/TechMatrix';
import ProjectsGrid from '@/components/public/ProjectsGrid';
import ServicesTiers from '@/components/public/ServicesTiers';
import Testimonials from '@/components/public/Testimonials';
import BookingCalendar from '@/components/public/BookingCalendar';
import Footer from '@/components/public/Footer';

export default function Home() {
  const [selectedTag, setSelectedTag] = useState('');

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TechMatrix selectedTag={selectedTag} onTagSelect={setSelectedTag} />
        <ProjectsGrid selectedTag={selectedTag} />
        <ServicesTiers />
        <Testimonials />
        <BookingCalendar />
      </main>
      <Footer />
    </>
  );
}
