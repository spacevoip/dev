import React from 'react';
import Navbar from '../components/Navbar';
import PricingSection from '../components/PricingSection';
import SipTrunkSection from '../components/SipTrunkSection';
import VirtualNumberSection from '../components/VirtualNumberSection';

const PricingPage = () => {
  return (
    <div className="min-h-screen relative">
      {/* Primary gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary opacity-95" />
      
      {/* Decorative gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-secondary/30 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-primary-light/30 via-transparent to-transparent blur-3xl" />
      </div>
      
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-5 mix-blend-overlay" />
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <PricingSection />
        <SipTrunkSection />
        <VirtualNumberSection />
      </div>
    </div>
  );
};

export default PricingPage;