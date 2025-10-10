import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import styles from './SentimentChart.module.css';

// --- Mock Data and Types ---

interface SentimentDataPoint {
  section: string; // e.g., 'Paragraph 1-5'
  sentiment: number; // -1 (negative) to 1 (positive)
  confidence: number; // 0 to 1
}

const mockSentimentData: SentimentDataPoint[] = [
  { section: 'Sec 1', sentiment: 0.2, confidence: 0.95 },
  { section: 'Sec 2', sentiment: 0.5, confidence: 0.98 },
  { section: 'Sec 3', sentiment: 0.3, confidence: 0.88 },
  { section: 'Sec 4', sentiment: -0.4, confidence: 0.92 },
  { section: 'Sec 5', sentiment: -0.2, confidence: 0.85 },
  { section: 'Sec 6', sentiment: 0.8, confidence: 0.99 },
  { section: 'Sec 7', sentiment: 0.7, confidence: 0.97 },
];

// --- Helper Functions ---

// Harmonic Mean: n / (Σ(1/x_i))
const calculateHarmonicMean = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sumOfReciprocals = numbers.reduce((acc, num) => acc + (1 / num), 0);
  return numbers.length / sumOfReciprocals;
};

// Dharma Index (Stability): Lower is more stable.
// Using standard deviation of sentiment as a proxy for stability.
const calculateDharmaIndex = (sentiments: number[]): number => {
  if (sentiments.length < 2) return 0;
  const mean = sentiments.reduce((acc, val) => acc + val, 0) / sentiments.length;
  const variance = sentiments.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sentiments.length;
  return Math.sqrt(variance);
};


// --- Component ---

interface SentimentChartProps {
  data?: SentimentDataPoint[];
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ data = mockSentimentData }) => {
  const { harmonicMeanConfidence, dharmaIndex } = useMemo(() => {
    const confidences = data.map(d => d.confidence);
    const sentiments = data.map(d => d.sentiment);

    return {
      harmonicMeanConfidence: calculateHarmonicMean(confidences),
      dharmaIndex: calculateDharmaIndex(sentiments),
    };
  }, [data]);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.header}>Document Sentiment Analysis</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(78, 203, 195, 0.2)" />
            <XAxis dataKey="section" stroke="var(--color-cream)" />
            <YAxis domain={[-1, 1]} stroke="var(--color-cream)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-navy)',
                borderColor: 'var(--color-teal-dark)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="var(--color-gold)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.indicators}>
        <div className={styles.indicator}>
          <div className={styles.indicatorLabel}>Dharma Index (Stability)</div>
          <div className={styles.indicatorValue}>{dharmaIndex.toFixed(3)}</div>
        </div>
        <div className={styles.indicator}>
          <div className={styles.indicatorLabel}>Harmonic Mean Confidence</div>
          <div className={styles.indicatorValue}>{(harmonicMeanConfidence * 100).toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
};