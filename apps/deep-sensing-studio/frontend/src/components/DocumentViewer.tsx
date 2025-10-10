import React from 'react';
import { useQuaternionVisualization } from '../hooks/useQuaternionVisualization';
import styles from './DocumentViewer.module.css';
import clsx from 'clsx';

// --- Mock Data and Types (for demonstration) ---

type EntityType = 'PERSON' | 'ORGANIZATION' | 'LOCATION';
type Confidence = 'high' | 'medium' | 'low';

interface Entity {
  text: string;
  type: EntityType;
  confidence: Confidence;
}

interface Document {
  id: string;
  content: string;
  entities: Entity[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

const mockDocument: Document = {
  id: 'doc-123',
  content: "Nikola Tesla, a Serbian-American inventor, conducted experiments in Colorado Springs. His company, the Tesla Electric Light & Manufacturing, was founded in 1886. The work was groundbreaking.",
  entities: [
    { text: "Nikola Tesla", type: 'PERSON', confidence: 'high' },
    { text: "Serbian-American", type: 'ORGANIZATION', confidence: 'medium' },
    { text: "Colorado Springs", type: 'LOCATION', confidence: 'high' },
    { text: "Tesla Electric Light & Manufacturing", type: 'ORGANIZATION', confidence: 'low' },
  ],
  sentiment: 'positive',
};

// --- Helper Function ---

const renderContentWithEntities = (doc: Document) => {
  let content = doc.content;
  doc.entities.forEach(entity => {
    const entityClass = clsx(styles.entity, styles[`entity_${entity.confidence}`]);
    content = content.replace(
      entity.text,
      `<span class="${entityClass}">${entity.text}</span>`
    );
  });
  return { __html: content };
};

// --- Component ---

interface DocumentViewerProps {
  document: Document | null;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document = mockDocument }) => {
  const { quaternion, isLoading } = useQuaternionVisualization(document?.id ?? null);

  if (!document) {
    return (
      <div className={styles.wrapper}>
        <p>No document selected.</p>
      </div>
    );
  }

  const sentimentClass = styles[`sentiment_${document.sentiment}`];

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <button className={styles.controlButton}>Zoom In</button>
        <button className={styles.controlButton}>Zoom Out</button>
        <button className={styles.controlButton}>Reset</button>
      </div>

      <div className={clsx(styles.documentPreview, sentimentClass)}>
        <div dangerouslySetInnerHTML={renderContentWithEntities(document)} />
      </div>

      <div className={styles.quaternionVis}>
        <h4>Quaternion Embedding</h4>
        {isLoading ? (
          <p>Loading Visualization...</p>
        ) : quaternion ? (
          <p className={styles.quaternionData}>
            {quaternion.a.toFixed(3)} + {quaternion.b.toFixed(3)}i + {quaternion.c.toFixed(3)}j + {quaternion.d.toFixed(3)}k
          </p>
        ) : (
          <p>No quaternion data available.</p>
        )}
      </div>
    </div>
  );
};