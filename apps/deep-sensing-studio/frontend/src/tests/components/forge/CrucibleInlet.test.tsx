import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CrucibleInlet from '../../../components/forge/CrucibleInlet';
import { useDocumentUpload } from '../../../hooks/useDocumentUpload';

vi.mock('../../../hooks/useDocumentUpload');

describe('CrucibleInlet', () => {
  it('renders the dropzone message', () => {
    (useDocumentUpload as any).mockReturnValue({
      onDrop: vi.fn(),
      files: [],
      status: 'IDLE',
      progress: 0,
      error: null,
    });

    render(<CrucibleInlet onFileUpload={vi.fn()} />);
    expect(screen.getByText(/Drag 'n' drop some files here/i)).toBeInTheDocument();
  });

  it('displays selected files', () => {
    const files = [new File(['hello'], 'hello.png', { type: 'image/png' })];
    (useDocumentUpload as any).mockReturnValue({
      onDrop: vi.fn(),
      files: files,
      status: 'IDLE',
      progress: 0,
      error: null,
    });

    render(<CrucibleInlet onFileUpload={vi.fn()} />);
    expect(screen.getByText('hello.png')).toBeInTheDocument();
  });

  it('shows progress when uploading', () => {
    (useDocumentUpload as any).mockReturnValue({
      onDrop: vi.fn(),
      files: [new File(['hello'], 'hello.png', { type: 'image/png' })],
      status: 'UPLOADING',
      progress: 50,
      error: null,
    });

    render(<CrucibleInlet onFileUpload={vi.fn()} />);
    expect(screen.getByText('Forging in progress...')).toBeInTheDocument();
    expect(screen.getByTestId('progress-indicator')).toHaveStyle({ width: '50%' });
  });
});