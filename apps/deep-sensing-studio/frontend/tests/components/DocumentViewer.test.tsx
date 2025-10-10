import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentViewer } from '../../src/components/DocumentViewer';
import { useQuaternionVisualization } from '../../src/hooks/useQuaternionVisualization';

// Mock the custom hook
vi.mock('../../src/hooks/useQuaternionVisualization');

const mockDoc = {
  id: 'doc-abc',
  content: "Test content with PERSON and LOCATION.",
  entities: [
    { text: "PERSON", type: 'PERSON', confidence: 'high' },
    { text: "LOCATION", type: 'LOCATION', confidence: 'medium' },
  ],
  sentiment: 'neutral' as const,
};

describe('DocumentViewer Component', () => {
  it('renders "No document selected" when no document is provided', () => {
    // Arrange
    vi.mocked(useQuaternionVisualization).mockReturnValue({
      quaternion: null,
      isLoading: false,
      error: null,
    });

    // Act
    render(<DocumentViewer document={null} />);

    // Assert
    expect(screen.getByText('No document selected.')).toBeInTheDocument();
  });

  it('renders document content and entities correctly', () => {
    // Arrange
    vi.mocked(useQuaternionVisualization).mockReturnValue({
      quaternion: null,
      isLoading: false,
      error: null,
    });

    // Act
    render(<DocumentViewer document={mockDoc} />);

    // Assert
    expect(screen.getByText('PERSON')).toBeInTheDocument();
    expect(screen.getByText('LOCATION')).toBeInTheDocument();
    // Check for the rendered text content (might be partial)
    expect(screen.getByText(/Test content with/)).toBeInTheDocument();
  });

  it('displays loading state for quaternion visualization', () => {
    // Arrange
    vi.mocked(useQuaternionVisualization).mockReturnValue({
      quaternion: null,
      isLoading: true,
      error: null,
    });

    // Act
    render(<DocumentViewer document={mockDoc} />);

    // Assert
    expect(screen.getByText('Loading Visualization...')).toBeInTheDocument();
  });

  it('displays the quaternion data when loaded', () => {
    // Arrange
    const mockQuaternion = { a: 0.1, b: 0.2, c: 0.3, d: 0.4 };
    vi.mocked(useQuaternionVisualization).mockReturnValue({
      quaternion: mockQuaternion,
      isLoading: false,
      error: null,
    });

    // Act
    render(<DocumentViewer document={mockDoc} />);

    // Assert
    const expectedText = /0.100 \+ 0.200i \+ 0.300j \+ 0.400k/;
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});