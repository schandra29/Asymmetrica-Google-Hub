"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex text-gold">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i}>{i < rating ? '★' : '☆'}</span>
    ))}
  </div>
);

const TestimonialCard = ({ quote, name, title, companyLogo, photo }: { quote: string, name: string, title: string, companyLogo: string, photo: string }) => (
  <div className="bg-navy-light p-phi-lg rounded-lg h-full flex flex-col">
    <StarRating rating={5} />
    <p className="font-sans text-cream my-phi-md flex-grow">"{quote}"</p>
    <div className="flex items-center gap-x-phi-sm mt-auto">
      <div className="w-12 h-12 rounded-full bg-orange-light flex-shrink-0">
        <img src={photo} alt={name} className="w-full h-full rounded-full object-cover" />
      </div>
      <div>
        <p className="font-bold text-gold">{name}</p>
        <p className="text-cream/80 text-sm">{title}</p>
      </div>
      <div className="ml-auto w-24 h-12 flex items-center justify-center flex-shrink-0">
          <img src={companyLogo} alt="Company Logo" className="max-h-8" />
      </div>
    </div>
  </div>
);

const testimonials = [
    {
      quote: "Asymmetrica's tech is a quantum leap. We've cut our data storage costs in half.",
      name: 'Jane Doe',
      title: 'CTO, Innovate Inc.',
      photo: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
      companyLogo: 'https://via.placeholder.com/100x40.png?text=Innovate'
    },
    {
      quote: "The outlier detection is uncanny. We're finding insights we never could before.",
      name: 'John Smith',
      title: 'Head of Data, Analytics Corp.',
      photo: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
      companyLogo: 'https://via.placeholder.com/100x40.png?text=Analytics'
    },
    {
      quote: "Processing is not just fast, it's... harmonious. The 4.909 Hz cycle is surprisingly effective.",
      name: 'Sam Wilson',
      title: 'Lead Engineer, Future Systems',
      photo: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
      companyLogo: 'https://via.placeholder.com/100x40.png?text=Future'
    },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 814.8); // 4x Tesla Harmonic
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <section className="w-full bg-navy py-phi-xl px-phi-md">
      <div className="container mx-auto">
        <h2 className="font-display text-4xl font-bold text-cream mb-phi-lg text-center">
          What Our Partners Say
        </h2>
        <div className="relative w-full max-w-2xl mx-auto h-64">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4074 }} // 2x Tesla Harmonic
              className="absolute w-full h-full"
            >
              <TestimonialCard {...testimonials[index]} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-x-phi-sm mt-phi-md">
            {testimonials.map((_, i) => (
                <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${index === i ? 'bg-gold' : 'bg-teal-dark/50'}`}
                />
            ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;