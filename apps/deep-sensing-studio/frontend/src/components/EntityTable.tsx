import React, { useState, useMemo } from 'react';
import * as Slider from '@radix-ui/react-slider';
import styles from './EntityTable.module.css';
import clsx from 'clsx';

// --- Mock Data and Types ---

type EntityType = 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'DATE' | 'MISC';
type Regime = 'support' | 'exploration' | 'balance';

interface Entity {
  id: number;
  text: string;
  type: EntityType;
  confidence: number; // 0-100
  position: number; // character offset
  regime: Regime;
}

const mockEntities: Entity[] = [
  { id: 1, text: 'Nikola Tesla', type: 'PERSON', confidence: 98, position: 0, regime: 'support' },
  { id: 2, text: 'Colorado Springs', type: 'LOCATION', confidence: 95, position: 50, regime: 'support' },
  { id: 3, text: '1886', type: 'DATE', confidence: 85, position: 120, regime: 'balance' },
  { id: 4, text: 'Tesla Electric', type: 'ORGANIZATION', confidence: 75, position: 95, regime: 'exploration' },
  { id: 5, text: 'groundbreaking', type: 'MISC', confidence: 60, position: 150, regime: 'exploration' },
  { id: 6, text: 'inventor', type: 'MISC', confidence: 99, position: 25, regime: 'support' },
];

type SortKey = keyof Entity;
type SortOrder = 'asc' | 'desc';

// --- Component ---

export const EntityTable: React.FC = () => {
  const [entities] = useState<Entity[]>(mockEntities);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'confidence', order: 'desc' });
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [typeFilter, setTypeFilter] = useState<EntityType | 'ALL'>('ALL');

  const filteredAndSortedEntities = useMemo(() => {
    let sortableEntities = [...entities];

    // Filter by confidence
    sortableEntities = sortableEntities.filter(e => e.confidence >= confidenceThreshold);

    // Filter by type
    if (typeFilter !== 'ALL') {
      sortableEntities = sortableEntities.filter(e => e.type === typeFilter);
    }

    // Sort
    sortableEntities.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.order === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });

    return sortableEntities;
  }, [entities, sortConfig, confidenceThreshold, typeFilter]);

  const requestSort = (key: SortKey) => {
    let order: SortOrder = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
  };

  const exportToCSV = () => {
    // Basic CSV export logic
    const headers = ['ID', 'Text', 'Type', 'Confidence', 'Position', 'Regime'];
    const rows = filteredAndSortedEntities.map(e => [e.id, e.text, e.type, e.confidence, e.position, e.regime].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "entities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <div className={styles.filters}>
          <select onChange={(e) => setTypeFilter(e.target.value as EntityType | 'ALL')} value={typeFilter}>
            <option value="ALL">All Types</option>
            <option value="PERSON">Person</option>
            <option value="ORGANIZATION">Organization</option>
            <option value="LOCATION">Location</option>
            <option value="DATE">Date</option>
            <option value="MISC">Misc</option>
          </select>
          <div className={styles.sliderWrapper}>
            <label>Confidence ≥ {confidenceThreshold}%</label>
            <Slider.Root
              defaultValue={[50]}
              max={100}
              step={1}
              onValueChange={(value) => setConfidenceThreshold(value[0])}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', userSelect: 'none', touchAction: 'none', width: 150, height: 20 }}
            >
              <Slider.Track style={{ backgroundColor: 'var(--color-cream)', position: 'relative', flexGrow: 1, borderRadius: '9999px', height: 3 }}>
                <Slider.Range style={{ position: 'absolute', backgroundColor: 'var(--color-gold)', borderRadius: '9999px', height: '100%' }} />
              </Slider.Track>
              <Slider.Thumb style={{ display: 'block', width: 16, height: 16, backgroundColor: 'var(--color-gold)', borderRadius: '9999px' }} />
            </Slider.Root>
          </div>
        </div>
        <button onClick={exportToCSV} className={styles.exportButton}>Export CSV</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => requestSort('text')}>Entity</th>
            <th onClick={() => requestSort('type')}>Type</th>
            <th onClick={() => requestSort('confidence')}>Confidence ↓</th>
            <th onClick={() => requestSort('position')}>Position</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedEntities.map(entity => (
            <tr key={entity.id} className={clsx(styles[`regime_${entity.regime}`])}>
              <td>{entity.text}</td>
              <td>{entity.type}</td>
              <td>{entity.confidence}%</td>
              <td>{entity.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};