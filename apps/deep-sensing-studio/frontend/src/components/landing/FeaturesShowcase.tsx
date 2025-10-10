import React from 'react';

const FeatureCard = ({ icon, stat, description, link }: { icon: string, stat: string, description: string, link: string }) => (
  <div className="flex flex-col items-center p-phi-lg bg-navy-light rounded-lg border border-teal-dark/20 text-center">
    {/* Icon Placeholder */}
    <div className="w-16 h-16 bg-teal-dark rounded-full mb-phi-md flex items-center justify-center">
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="font-display text-3xl font-bold text-gold mb-phi-xs">{stat}</h3>
    <p className="font-sans text-cream mb-phi-md">{description}</p>
    <a href={link} className="font-sans text-teal-light hover:text-gold transition-colors">
      Learn More &rarr;
    </a>
  </div>
);

const FeaturesShowcase = () => {
  const features = [
    {
      icon: '🔄',
      stat: '768D → 4D',
      description: '50% storage savings via Quaternion Compression.',
      link: '#',
    },
    {
      icon: '📊',
      stat: '33.5% Better',
      description: 'Superior outlier detection with Vedic Statistics.',
      link: '#',
    },
    {
      icon: '⚡️',
      stat: '4.909 Hz Rhythm',
      description: 'Natural system timing using Tesla Harmonics.',
      link: '#',
    },
  ];

  return (
    <section className="w-full bg-navy py-phi-xl px-phi-md">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-phi-lg">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;