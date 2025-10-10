import { useState, useEffect, useCallback } from 'react';

// --- Types ---

interface SearchResult {
  id: string;
  documentTitle: string;
  snippet: string;
  similarity: number; // 0 to 1
}

interface SemanticSearchState {
  query: string;
  results: SearchResult[];
  history: string[];
  isLoading: boolean;
  error: string | null;
}

// Mock API response
const mockSearchResults: SearchResult[] = [
  { id: 'doc-1', documentTitle: 'Tesla\'s Colorado Experiments', snippet: '...the experiments focused on wireless power transmission...', similarity: 0.92 },
  { id: 'doc-2', documentTitle: 'Wardenclyffe Tower History', snippet: '...a testament to Tesla\'s vision for a global wireless system...', similarity: 0.88 },
  { id: 'doc-3', documentTitle: 'AC Motor Patents', snippet: '...the polyphase AC induction motor, a key invention...', similarity: 0.75 },
];

const DEBOUNCE_DELAY_MS = 203.7; // Tesla harmonic timing

export const useSemanticSearch = () => {
  const [state, setState] = useState<SemanticSearchState>({
    query: '',
    results: [],
    history: ['Tesla', 'wireless power', 'AC motor'], // Mock history
    isLoading: false,
    error: null,
  });

  const setQuery = (newQuery: string) => {
    setState(prevState => ({ ...prevState, query: newQuery }));
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setState(prevState => ({ ...prevState, results: [], isLoading: false }));
      return;
    }

    setState(prevState => ({ ...prevState, isLoading: true, error: null }));

    // Mock API call
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
      const filteredResults = mockSearchResults.filter(r =>
        r.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.documentTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setState(prevState => ({
        ...prevState,
        results: filteredResults,
        isLoading: false,
        history: [...new Set([searchQuery, ...prevState.history])].slice(0, 5), // Add to history
      }));
    } catch (err) {
      setState(prevState => ({ ...prevState, error: 'Search failed.', isLoading: false }));
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(state.query);
    }, DEBOUNCE_DELAY_MS);

    // Cleanup function to cancel the timeout if the query changes
    return () => {
      clearTimeout(handler);
    };
  }, [state.query, performSearch]);

  return { ...state, setQuery };
};