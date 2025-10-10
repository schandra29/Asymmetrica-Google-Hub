import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from '../../src/components/SearchBar';
import { useSemanticSearch } from '../../src/hooks/useSemanticSearch';

// Mock the custom hook
vi.mock('../../src/hooks/useSemanticSearch');

const mockSetQuery = vi.fn();

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the search input', () => {
    // Arrange
    vi.mocked(useSemanticSearch).mockReturnValue({
      query: '',
      setQuery: mockSetQuery,
      results: [],
      history: [],
      isLoading: false,
      error: null,
    });

    // Act
    render(<SearchBar />);

    // Assert
    expect(screen.getByPlaceholderText(/Enter semantic query/i)).toBeInTheDocument();
  });

  it('calls setQuery when user types in the input', () => {
    // Arrange
    vi.mocked(useSemanticSearch).mockReturnValue({
      query: '',
      setQuery: mockSetQuery,
      results: [],
      history: [],
      isLoading: false,
      error: null,
    });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Enter semantic query/i);
    fireEvent.change(input, { target: { value: 'Tesla' } });

    // Assert
    expect(mockSetQuery).toHaveBeenCalledWith('Tesla');
  });

  it('displays the loading spinner when isLoading is true', () => {
    // Arrange
    vi.mocked(useSemanticSearch).mockReturnValue({
      query: 'Tesla',
      setQuery: mockSetQuery,
      results: [],
      history: [],
      isLoading: true,
      error: null,
    });

    // Act
    render(<SearchBar />);

    // Assert
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays search results when available', () => {
    // Arrange
    vi.mocked(useSemanticSearch).mockReturnValue({
      query: 'Tesla',
      setQuery: mockSetQuery,
      results: [{ id: '1', documentTitle: 'Result 1', snippet: 'Snippet 1', similarity: 0.9 }],
      history: [],
      isLoading: false,
      error: null,
    });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Enter semantic query/i);
    act(() => {
      input.focus();
    });

    // Assert
    expect(screen.getByText('Result 1')).toBeInTheDocument();
    expect(screen.getByText(/Snippet 1/)).toBeInTheDocument();
  });

  it('displays search history when input is focused and empty', () => {
    // Arrange
    vi.mocked(useSemanticSearch).mockReturnValue({
      query: '',
      setQuery: mockSetQuery,
      results: [],
      history: ['Previous search'],
      isLoading: false,
      error: null,
    });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Enter semantic query/i);
    act(() => {
      input.focus();
    });

    // Assert
    expect(screen.getByText('Recent Searches:')).toBeInTheDocument();
    expect(screen.getByText('Previous search')).toBeInTheDocument();
  });
});