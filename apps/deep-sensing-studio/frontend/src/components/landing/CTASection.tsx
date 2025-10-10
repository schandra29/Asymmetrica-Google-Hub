import React from 'react';

const CTASection = () => {
  return (
    <section className="relative w-full bg-navy-dark py-phi-xl px-phi-md text-center overflow-hidden">
      {/* Background Gradient Mesh Placeholder */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-dark/20 via-orange-dark/20 to-gold/20 opacity-30 -z-0" />

      <div className="container mx-auto flex flex-col items-center relative z-10">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-phi-md">
          Ready to Transform Your Documents?
        </h2>
        <p className="font-sans text-lg text-cream/80 mb-phi-lg max-w-2xl">
          Sign up for our beta to get early access and start leveraging the power of quaternion-based understanding today.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-phi-sm mb-phi-md">
          <input
            type="email"
            placeholder="your.email@company.com"
            className="bg-navy-light border border-teal-dark/50 text-cream placeholder-cream/50 px-phi-md py-phi-sm rounded-lg focus:ring-2 focus:ring-gold focus:outline-none w-full sm:w-auto"
          />
          <button className="bg-gold hover:bg-orange-light text-navy font-bold py-phi-sm px-phi-lg rounded-lg transition-colors duration-300 w-full sm:w-auto">
            Get Beta Access
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;