"use client";

import React from 'react';
import { SearchResult } from '../../hooks/useSemanticSearch';

interface AnvilResultsProps {
  results: SearchResult[];
  status: 'IDLE' | 'SEARCHING' | 'SUCCESS' | 'ERROR';
}

const AnvilResults: React.FC<AnvilResultsProps> = ({ results, status }) => {
  if (status === 'SEARCHING') {
    return (
      <div className="w-full max-w-xl mt-8 space-y-4" data-testid="skeleton-loader">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'ERROR') {
    return <p className="text-red-500 mt-4">An error occurred during the search.</p>;
  }

  if (status === 'SUCCESS' && results.length === 0) {
    return <p className="text-gray-400 mt-4">No results found.</p>;
  }

  return (
    <div className="w-full max-w-xl mt-8 space-y-4">
      {results.map(result => (
        <div key={result.id} className="bg-gray-800 p-4 rounded-lg">
          <p className="text-white">{result.content}</p>
          <p className="text-gray-400 text-sm mt-2">Score: {result.score.toFixed(4)}</p>
        </div>
      ))}
    </div>
  );
};

export default AnvilResults;