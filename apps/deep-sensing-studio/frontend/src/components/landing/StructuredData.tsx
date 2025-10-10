import React from 'react';

const StructuredData = () => {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Asymmetrica",
        "url": "https://asymmetrica.ai", // Placeholder URL
        "logo": "https://asymmetrica.ai/logo.png", // Placeholder Logo URL
        "sameAs": [
          "https://twitter.com/asymmetrica", // Placeholder Social
          "https://www.linkedin.com/company/asymmetrica" // Placeholder Social
        ]
      },
      {
        "@type": "WebSite",
        "name": "Deep-Sensing Studio",
        "url": "https://asymmetrica.ai", // Placeholder URL
        "publisher": {
          "@type": "Organization",
          "name": "Asymmetrica"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://asymmetrica.ai/search?q={search_term_string}", // Placeholder Search URL
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default StructuredData;