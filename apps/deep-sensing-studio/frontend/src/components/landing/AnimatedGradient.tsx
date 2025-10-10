"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AnimatedGradient = () => {
  const gradientRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(gradientRef.current, {
        background: 'radial-gradient(circle, var(--color-teal-dark) 0%, var(--color-navy) 70%)',
        duration: 5,
        ease: 'power1.inOut',
      })
      .to(gradientRef.current, {
        background: 'radial-gradient(circle, var(--color-orange-dark) 0%, var(--color-navy) 70%)',
        duration: 5,
        ease: 'power1.inOut',
      })
      .to(gradientRef.current, {
        background: 'radial-gradient(circle, var(--color-gold) 0%, var(--color-navy) 70%)',
        duration: 5,
        ease: 'power1.inOut',
      });

      // Tesla Pulse effect
      gsap.to(gradientRef.current, {
        opacity: 0.9,
        duration: 0.2037, // ~1/4.909 Hz
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }, gradientRef);
    return () => ctx.revert();
  }, []);

  return <div ref={gradientRef} className="absolute top-0 left-0 w-full h-full opacity-80" />;
};

export default AnimatedGradient;