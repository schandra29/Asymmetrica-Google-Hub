import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnvilResults from '../../../components/forge/AnvilResults';
import { SearchResult } from '../../../hooks/useSemanticSearch';

describe('AnvilResults', () => {
  it('renders skeleton loaders when searching', () => {
    render(<AnvilResults results={[]} status="SEARCHING" />);
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('renders "No results found" message', () => {
    render(<AnvilResults results={[]} status="SUCCESS" />);
    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });

  it('renders search results', () => {
    const results: SearchResult[] = [
      { id: '1', content: 'Result 1', score: 0.9 },
      { id: '2', content: 'Result 2', score: 0.8 },
    ];
    render(<AnvilResults results={results} status="SUCCESS" />);
    expect(screen.getByText('Result 1')).toBeInTheDocument();
    expect(screen.getByText('Result 2')).toBeInTheDocument();
  });
});