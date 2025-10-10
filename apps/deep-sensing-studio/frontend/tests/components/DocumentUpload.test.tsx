import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentUpload } from '../../src/components/DocumentUpload';
import { useDocumentUpload } from '../../src/hooks/useDocumentUpload';

// Mock the custom hook
vi.mock('../../src/hooks/useDocumentUpload');

describe('DocumentUpload Component', () => {
  it('renders the dropzone instruction', () => {
    // Arrange
    vi.mocked(useDocumentUpload).mockReturnValue({
      uploadState: {
        files: [],
        progress: 0,
        error: null,
        isUploading: false,
      },
      onDrop: () => {},
    });

    // Act
    render(<DocumentUpload />);

    // Assert
    expect(screen.getByText(/Drag & drop files here/i)).toBeInTheDocument();
  });

  it('displays an error message when an error occurs', () => {
    // Arrange
    const errorMessage = 'File type not supported';
    vi.mocked(useDocumentUpload).mockReturnValue({
      uploadState: {
        files: [],
        progress: 0,
        error: errorMessage,
        isUploading: false,
      },
      onDrop: () => {},
    });

    // Act
    render(<DocumentUpload />);

    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows a progress bar when uploading', () => {
    // Arrange
    vi.mocked(useDocumentUpload).mockReturnValue({
      uploadState: {
        files: [new File(['content'], 'test.pdf', { type: 'application/pdf' })],
        progress: 50,
        error: null,
        isUploading: true,
      },
      onDrop: () => {},
    });

    // Act
    render(<DocumentUpload />);

    // Assert
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/Uploading 1 file\(s\)/i)).toBeInTheDocument();
  });

  it('displays the list of selected files when not uploading', () => {
    // Arrange
    const testFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    vi.mocked(useDocumentUpload).mockReturnValue({
      uploadState: {
        files: [testFile],
        progress: 0,
        error: null,
        isUploading: false,
      },
      onDrop: () => {},
    });

    // Act
    render(<DocumentUpload />);

    // Assert
    expect(screen.getByText('Selected Files:')).toBeInTheDocument();
    expect(screen.getByText(/document.pdf/i)).toBeInTheDocument();
  });
});