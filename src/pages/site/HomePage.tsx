import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatsSection from '../components/stats/StatsSection';
import ServicesSection from '../components/ServicesSection';

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-primary relative">
        <Navbar />
        <Hero />
      </div>
      <StatsSection />
      <ServicesSection />
    </div>
  );
}

export default HomePage;