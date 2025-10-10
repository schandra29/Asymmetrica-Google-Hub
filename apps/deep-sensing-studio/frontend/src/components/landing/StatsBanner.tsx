import React from 'react';
import AnimatedStat from './AnimatedStat';

const StatsBanner = () => {
  const stats = [
    { value: '50%', label: 'Storage Reduction' },
    { value: '33.5%', label: 'Better Accuracy' },
    { value: '4.909', label: 'Hz Processing' }, // Note: Removed Hz from value for animation
    { value: '99.9%', label: 'Uptime' },
    { value: '10ms', label: 'Query Time' },
    { value: '1M+', label: 'Documents' },
  ];

  return (
    <section className="w-full bg-navy-dark py-phi-lg">
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-x-phi-lg gap-y-phi-md">
          {stats.map((stat, index) => (
            <AnimatedStat key={index} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;