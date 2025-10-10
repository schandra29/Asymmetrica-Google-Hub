import React from 'react';

// Placeholder for the DocumentUpload component from JULES-02
const DocumentUploadPlaceholder = () => (
  <div className="w-full max-w-xl h-64 bg-navy-light border-2 border-dashed border-teal-dark/50 rounded-lg flex flex-col items-center justify-center p-phi-lg text-center">
    <h3 className="font-display text-2xl text-gold mb-phi-sm">DocumentUpload Component</h3>
    <p className="text-cream">Real-time OCR, quaternion encoding, and entity extraction will be shown here.</p>
  </div>
);

const LiveDemo = () => {
  return (
    <section id="demo" className="w-full bg-navy-dark py-phi-xl px-phi-md text-center">
      <div className="container mx-auto flex flex-col items-center">
        <h2 className="font-display text-4xl font-bold text-cream mb-phi-lg">
          Live Demo
        </h2>
        <DocumentUploadPlaceholder />
        <div className="mt-phi-md inline-flex items-center gap-x-phi-sm bg-gold/10 text-gold font-bold py-phi-xs px-phi-sm rounded-full">
          <span className="text-sm">⚡️</span>
          <span className="font-sans text-sm">Powered by Vedic Mathematics</span>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;