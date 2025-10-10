"use client";

import { motion, useInView, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  label: string;
}

const AnimatedStat = ({ value, label }: Props) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const numericValue = parseFloat(value);
  const motionValue = useSpring(0, { damping: 50, stiffness: 200 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(numericValue);
    }
  }, [isInView, numericValue, motionValue]);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        // Handle floating point numbers and integers differently
        const isInt = Number.isInteger(numericValue);
        const formattedValue = isInt ? Math.round(latest) : latest.toFixed(1);

        const prefix = value.match(/^\D+/)?.[0] || '';
        const suffix = value.match(/\D+$/)?.[0] || '';

        ref.current.textContent = `${prefix}${formattedValue}${suffix}`;
      }
    });
    return unsubscribe;
  }, [motionValue, value, numericValue]);

  return (
    <div className="text-center p-phi-md">
      <p ref={ref} className="font-display text-4xl md:text-5xl font-bold text-gold">0</p>
      <p className="font-sans text-cream uppercase tracking-widest">{label}</p>
    </div>
  );
};

export default AnimatedStat;