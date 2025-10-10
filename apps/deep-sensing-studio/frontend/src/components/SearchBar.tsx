import React, { useState } from 'react';
import { useSemanticSearch } from '../hooks/useSemanticSearch';
import styles from './SearchBar.module.css';
import clsx from 'clsx';

export const SearchBar: React.FC = () => {
  const { query, setQuery, results, history, isLoading, error } = useSemanticSearch();
  const [isFocused, setIsFocused] = useState(false);

  const showResults = isFocused && (query.length > 0 || history.length > 0);

  const handleSelect = (term: string) => {
    setQuery(term);
    setIsFocused(false); // Hide results after selection
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter semantic query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow click
        />
        {isLoading && <div className={styles.spinner} role="alert" aria-busy="true" data-testid="loading-spinner"></div>}
      </div>

      {showResults && (
        <ul className={styles.resultsList}>
          {error && <li className={styles.resultItem}>{error}</li>}

          {results.length > 0 && results.map(result => (
            <li key={result.id} className={styles.resultItem} onMouseDown={() => handleSelect(result.documentTitle)}>
              <div className={styles.resultTitle}>{result.documentTitle}</div>
              <div className={styles.resultSnippet}>{result.snippet}</div>
              <div className={styles.resultSimilarity}>
                Similarity: {(result.similarity * 100).toFixed(1)}%
              </div>
            </li>
          ))}

          {results.length === 0 && query.length > 0 && !isLoading && (
             <li className={styles.resultItem}>No results found for "{query}".</li>
          )}

          {results.length === 0 && query.length === 0 && history.length > 0 && (
            <>
              <li className={clsx(styles.resultItem, styles.historyItem)} style={{ fontStyle: 'normal', color: 'var(--color-cream)'}}>Recent Searches:</li>
              {history.map((term, i) => (
                <li key={i} className={clsx(styles.resultItem, styles.historyItem)} onMouseDown={() => handleSelect(term)}>
                  {term}
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
};