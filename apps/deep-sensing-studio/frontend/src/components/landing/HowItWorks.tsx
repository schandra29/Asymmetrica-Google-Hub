import React from 'react';

const TimelineStep = ({ icon, title, description, isReversed }: { icon: string, title: string, description: string, isReversed?: boolean }) => (
  <div className={`flex items-center w-full ${isReversed ? 'flex-row-reverse' : 'flex-row'}`}>
    <div className="flex-1 flex flex-col items-center">
      <div className="w-16 h-16 bg-orange-dark rounded-full mb-phi-sm flex items-center justify-center text-3xl">
        {icon}
      </div>
      <div className={`text-center ${isReversed ? 'md:text-left' : 'md:text-right'}`}>
        <h3 className="font-display text-2xl font-bold text-gold">{title}</h3>
        <p className="text-cream">{description}</p>
      </div>
    </div>
    <div className="w-1/12 flex justify-center">
        <div className="w-1 h-full bg-teal-dark/30" />
    </div>
     <div className="flex-1" />
  </div>
);

const HowItWorks = () => {
  const steps = [
    { icon: '📄', title: 'Step 1: Upload', description: 'Start with any document format (PDF, DOCX, etc.).' },
    { icon: '✨', title: 'Step 2: Extract', description: 'Our engine performs OCR and quaternion encoding.' },
    { icon: '🧠', title: 'Step 3: Understand', description: 'Visualize entities, sentiment, and key topics.' },
    { icon: '🔍', title: 'Step 4: Search', description: 'Instantly query your documents with our RAG pipeline.' },
  ];

  return (
    <section className="w-full bg-navy py-phi-xl px-phi-md">
      <div className="container mx-auto flex flex-col items-center">
        <h2 className="font-display text-4xl font-bold text-cream mb-phi-xl text-center">
          How It Works
        </h2>
        <div className="relative w-full max-w-4xl flex flex-col items-center gap-y-phi-lg">
           <div className="absolute top-0 left-1/2 w-1 h-full bg-teal-dark/30 transform -translate-x-1/2" />
           {steps.map((step, index) => (
             <div key={index} className="relative w-full flex justify-between items-center">
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left order-2'}`}>
                    <h3 className="font-display text-2xl font-bold text-gold mb-phi-xs">{step.title}</h3>
                    <p className="text-cream">{step.description}</p>
                </div>
                <div className="w-16 h-16 bg-orange-dark rounded-full flex items-center justify-center text-3xl z-10">
                    {step.icon}
                </div>
                <div className="w-1/2" />
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;