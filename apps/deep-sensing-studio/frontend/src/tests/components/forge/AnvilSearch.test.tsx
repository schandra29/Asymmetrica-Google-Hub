import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnvilSearch from '../../../components/forge/AnvilSearch';
import { useSemanticSearch } from '../../../hooks/useSemanticSearch';

vi.mock('../../../hooks/useSemanticSearch');

describe('AnvilSearch', () => {
  it('renders the search input', () => {
    (useSemanticSearch as any).mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      status: 'IDLE',
    });
    render(<AnvilSearch />);
    expect(screen.getByPlaceholderText(/Query the purified data/i)).toBeInTheDocument();
  });

  it('calls setQuery on input change', () => {
    const setQuery = vi.fn();
    (useSemanticSearch as any).mockReturnValue({
      query: '',
      setQuery: setQuery,
      status: 'IDLE',
    });
    render(<AnvilSearch />);
    const input = screen.getByPlaceholderText(/Query the purified data/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(setQuery).toHaveBeenCalledWith('test query');
  });
});