"use client";

import { motion } from 'framer-motion';

interface Props {
  onClose: () => void;
}

const TeslaEasterEgg = ({ onClose }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="text-center text-cream p-phi-lg rounded-lg">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div
            className="absolute w-full h-full rounded-full bg-teal-light"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1 / 4.909, // ~0.2037s
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative z-10">
            <p className="font-display text-4xl font-bold text-gold">4.909 Hz</p>
            <p className="font-sans uppercase tracking-widest">Tesla Resonance</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeslaEasterEgg;