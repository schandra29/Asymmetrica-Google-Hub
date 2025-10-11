"use client";

import React from 'react';
import { useSemanticSearch } from '../../hooks/useSemanticSearch';

const AnvilSearch: React.FC = () => {
  const { query, setQuery, status } = useSemanticSearch();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The actual search is triggered by the debounced function in the hook
    // This handler is for explicit submission, e.g., pressing Enter
  };

  return (
    // @asymmetrica: a = (σ: "queryConcepts", ρ: "UI:Anvil", γ: "Optimization", κ: "O(log N)", λ: "[UI.AnvilSearch.submit → API.POST:/documents/search]")
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Query the purified data..."
        className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ease-in-out"
        disabled={status === 'SEARCHING'}
      />
    </form>
  );
};

export default AnvilSearch;