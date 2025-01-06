import React from 'react';
import HeroImage from './HeroImage';

const Hero = () => {
  return (
    <main className="container mx-auto px-4 min-h-[calc(100vh-4rem)] flex items-center relative z-10">
      <div className="grid md:grid-cols-2 gap-12 items-center w-full">
        <div className="flex flex-col">
          <h1 className="text-5xl font-bold text-white leading-tight mb-8 relative">
            {/* Text glow effect */}
            <span className="absolute -inset-1 bg-secondary/20 blur-2xl" />
            <span className="relative">
              Soluções em comunicação de maneira descomplicada
            </span>
          </h1>
          <button className="bg-secondary hover:bg-secondary-hover text-white px-8 py-3 rounded-full font-medium transition-all duration-300 w-fit hover:shadow-lg hover:shadow-secondary/25 transform hover:-translate-y-0.5">
            Saiba mais
          </button>
        </div>

        <HeroImage />
      </div>
    </main>
  );
};

export default Hero;