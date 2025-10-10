"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import client-side heavy components
const QuaternionScene = dynamic(() => import('./QuaternionScene'), {
  ssr: false,
});

const AnimatedGradient = dynamic(() => import('./AnimatedGradient'), {
  ssr: false,
});

const Hero = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center text-center text-cream overflow-hidden">
      {/* Background and 3D Visualization */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <AnimatedGradient />
        <div className="absolute top-0 left-0 w-full h-full opacity-50">
          <QuaternionScene />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center p-phi-md">
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tighter mb-phi-sm">
          Intelligence Beyond Dimensions
        </h1>
        <p className="font-sans text-lg md:text-xl max-w-2xl mb-phi-lg">
          Quaternion-powered document understanding with Vedic mathematics
        </p>
        <div className="flex gap-x-phi-md">
          <button className="bg-teal-dark hover:bg-teal-light text-white font-bold py-phi-sm px-phi-lg rounded-lg transition-colors duration-300">
            Start Processing
          </button>
          <button className="border border-cream hover:bg-cream hover:text-navy text-cream font-bold py-phi-sm px-phi-lg rounded-lg transition-colors duration-300">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;