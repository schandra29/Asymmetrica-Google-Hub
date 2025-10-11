import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

interface SearchState<T> {
  query: string;
  results: T[];
  status: 'IDLE' | 'SEARCHING' | 'SUCCESS' | 'ERROR';
  error: string | null;
}

// A generic search result type, adjust as needed for the actual API response
export interface SearchResult {
  id: string;
  content: string;
  score: number;
}

export const useSemanticSearch = () => {
  const [state, setState] = useState<SearchState<SearchResult>>({
    query: '',
    results: [],
    status: 'IDLE',
    error: null,
  });

  const search = async (currentQuery: string) => {
    if (!currentQuery) {
      setState(prevState => ({ ...prevState, results: [], status: 'IDLE' }));
      return;
    }

    setState(prevState => ({ ...prevState, status: 'SEARCHING', error: null }));

    try {
      const response = await fetch('/api/documents/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: currentQuery }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      setState(prevState => ({ ...prevState, status: 'SUCCESS', results }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  };

  const debouncedSearch = useCallback(debounce(search, 203.7), []);

  const setQuery = (newQuery: string) => {
    setState(prevState => ({ ...prevState, query: newQuery }));
    debouncedSearch(newQuery);
  };

  return { ...state, setQuery };
};