"use client";

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import TeslaEasterEgg from './TeslaEasterEgg';

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} className="text-cream/80 hover:text-gold transition-colors">
    {children}
  </a>
);

const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href} className="text-cream/80 hover:text-gold transition-colors">
        {children}
    </a>
)

const Footer = () => {
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  return (
    <>
      <footer className="w-full bg-navy-dark border-t border-teal-dark/20 py-phi-lg px-phi-md">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-phi-lg text-center md:text-left">
            {/* Column 1: Logo & Tagline */}
            <div className="flex flex-col items-center md:items-start">
              <div className="w-12 h-12 bg-teal-dark rounded-full mb-phi-sm flex items-center justify-center font-bold text-xl">
                A
              </div>
              <p className="font-display text-lg text-gold">Asymmetrica</p>
              <p className="text-cream/60">Intelligence Beyond Dimensions</p>
            </div>

            {/* Column 2: Navigation */}
            <div className="flex flex-col gap-y-phi-sm">
              <h3 className="font-display font-bold text-cream uppercase tracking-widest mb-phi-xs">Navigation</h3>
              <FooterLink href="#features">Features</FooterLink>
              <FooterLink href="#demo">Live Demo</FooterLink>
              <FooterLink href="#how-it-works">How It Works</FooterLink>
              <FooterLink href="#contact">Contact</FooterLink>
            </div>

            {/* Column 3: Social & Meta */}
            <div className="flex flex-col items-center md:items-end">
               <h3 className="font-display font-bold text-cream uppercase tracking-widest mb-phi-xs">Follow Us</h3>
               <div className="flex gap-x-phi-md mb-phi-md">
                  <SocialIcon href="#">X</SocialIcon>
                  <SocialIcon href="#">LI</SocialIcon>
                  <SocialIcon href="#">GH</SocialIcon>
               </div>
                <div
                  className="mt-auto inline-flex items-center gap-x-phi-sm bg-gold/10 text-gold font-bold py-phi-xs px-phi-sm rounded-full cursor-pointer"
                  title="Click for a surprise!"
                  onClick={() => setShowEasterEgg(true)}
                >
                  <span className="text-sm">⚡️</span>
                  <span className="font-sans text-sm">Built with Vedic Mathematics</span>
               </div>
            </div>
          </div>
          <div className="text-center text-cream/50 border-t border-teal-dark/10 mt-phi-lg pt-phi-md">
            <p>&copy; {new Date().getFullYear()} Asymmetrica. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <AnimatePresence>
        {showEasterEgg && <TeslaEasterEgg onClose={() => setShowEasterEgg(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Footer;