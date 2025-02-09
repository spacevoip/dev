import React from 'react';
import Navbar from '../components/Navbar';
import AutoDialerHero from '../components/autodialer/AutoDialerHero';
import AutoDialerFeatures from '../components/autodialer/AutoDialerFeatures';
import AutoDialerPlans from '../components/autodialer/AutoDialerPlans';
import CoverageSection from '../components/autodialer/CoverageSection';
import AdditionalInfo from '../components/autodialer/AdditionalInfo';

const AutoDialerPage = () => {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary opacity-95" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-5 mix-blend-overlay" />
      
      <div className="relative z-10">
        <Navbar />
        <AutoDialerHero />
        <AutoDialerFeatures />
        <AutoDialerPlans />
        <CoverageSection />
        <AdditionalInfo />
      </div>
    </div>
  );
};

export default AutoDialerPage;