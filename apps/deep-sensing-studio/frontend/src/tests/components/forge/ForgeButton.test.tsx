import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ForgeButton from '../../../components/forge/ForgeButton';

describe('ForgeButton', () => {
  it('renders with default text', () => {
    render(<ForgeButton onClick={vi.fn()} status="IDLE" disabled={false} />);
    expect(screen.getByRole('button', { name: /FORGE/i })).toBeInTheDocument();
  });

  it('is disabled when the disabled prop is true', () => {
    render(<ForgeButton onClick={vi.fn()} status="IDLE" disabled={true} />);
    expect(screen.getByRole('button', { name: /FORGE/i })).toBeDisabled();
  });

  it('displays "FORGING..." when uploading', () => {
    render(<ForgeButton onClick={vi.fn()} status="UPLOADING" disabled={false} />);
    expect(screen.getByRole('button', { name: /FORGING.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /FORGING.../i })).toBeDisabled();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ForgeButton onClick={handleClick} status="IDLE" disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: /FORGE/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});