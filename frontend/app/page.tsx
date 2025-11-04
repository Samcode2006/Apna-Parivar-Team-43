'use client';

import { useEffect } from 'react';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import CTA from '@/components/landing/CTA';

export default function Home() {
  useEffect(() => {
    // Handle hash-based navigation when the page loads
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const y = element.getBoundingClientRect().top + window.pageYOffset - 64;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    };

    // Initial check on component mount
    handleHashChange();

    // Add event listener for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className='min-h-screen bg-background'>
      <div id="home">
        <Hero />
      </div>
      <div id="features">
        <Features />
      </div>
      <div id="how">
        <HowItWorks />
      </div>
      <div id="contact">
        <CTA />
      </div>
    </div>
  );
}
