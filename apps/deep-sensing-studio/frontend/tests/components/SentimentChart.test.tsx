import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SentimentChart } from '../../src/components/SentimentChart';

// Recharts has issues with Vitest's environment. We mock ResponsiveContainer.
vi.mock('recharts', async () => {
  const originalModule = await vi.importActual('recharts');
  return {
    ...originalModule,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: '100%', height: '300px' }} data-testid="recharts-container">
        {children}
      </div>
    ),
  };
});

const mockData = [
  { section: 'S1', sentiment: 0.5, confidence: 0.8 },
  { section: 'S2', sentiment: -0.5, confidence: 0.6 },
];

describe('SentimentChart Component', () => {
  it('renders the chart title and indicators', () => {
    // Act
    render(<SentimentChart data={mockData} />);

    // Assert
    expect(screen.getByText('Document Sentiment Analysis')).toBeInTheDocument();
    expect(screen.getByText('Dharma Index (Stability)')).toBeInTheDocument();
    expect(screen.getByText('Harmonic Mean Confidence')).toBeInTheDocument();
  });

  it('calculates and displays the Dharma Index and Harmonic Mean correctly', () => {
    // Act
    render(<SentimentChart data={mockData} />);

    // Assert
    // Dharma Index (Std Dev of [0.5, -0.5]) = 0.5
    expect(screen.getByText('0.500')).toBeInTheDocument();
    // Harmonic Mean of [0.8, 0.6] = 2 / (1/0.8 + 1/0.6) = 2 / (1.25 + 1.666) = 2 / 2.9166 = 0.6857
    // Displayed as a percentage: 68.57%
    expect(screen.getByText('68.57%')).toBeInTheDocument();
  });

  it('renders the recharts container', () => {
    // Act
    render(<SentimentChart data={mockData} />);

    // Assert
    expect(screen.getByTestId('recharts-container')).toBeInTheDocument();
  });

  it('handles empty data without crashing', () => {
    // Act
    render(<SentimentChart data={[]} />);

    // Assert
    expect(screen.getByText('Document Sentiment Analysis')).toBeInTheDocument();
    // Dharma Index for empty array is 0
    expect(screen.getByText('0.000')).toBeInTheDocument();
    // Harmonic Mean for empty array is 0
    expect(screen.getByText('0.00%')).toBeInTheDocument();
  });
});