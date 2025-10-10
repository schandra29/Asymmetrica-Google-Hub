import React from 'react';
import {
  SearchBar,
  DocumentUpload,
  DocumentViewer,
  EntityTable,
  SentimentChart,
} from './components';
import './styles/tokens.css';
import './styles/animations.css';

const App: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-navy)',
      color: 'var(--color-cream)',
      fontFamily: 'var(--font-family-sans)',
      padding: 'var(--spacing-phi-xl)',
    }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-phi-xl)' }}>
        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '2.5rem',
          color: 'var(--color-gold)',
          margin: 0,
        }}>
          Deep-Sensing Studio
        </h1>
        <p style={{ color: 'var(--color-teal-light)', marginTop: 'var(--spacing-phi-xs)' }}>
          Autonomous R&D Laboratory for Knowledge Synthesis
        </p>
      </header>

      <main>
        <section style={{ marginBottom: 'var(--spacing-phi-xl)' }}>
          <SearchBar />
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--spacing-phi-xl)' }}>

          <aside>
            <div style={{ marginBottom: 'var(--spacing-phi-lg)' }}>
              <DocumentUpload />
            </div>
            <div>
              <SentimentChart />
            </div>
          </aside>

          <section>
            <div style={{ marginBottom: 'var(--spacing-phi-lg)' }}>
              <DocumentViewer document={null} />
            </div>
            <div>
              <EntityTable />
            </div>
          </section>

        </div>
      </main>

      <footer style={{
        textAlign: 'center',
        marginTop: 'var(--spacing-phi-xl)',
        paddingTop: 'var(--spacing-phi-lg)',
        borderTop: '1px solid var(--color-teal-dark)',
        fontSize: '0.9rem',
        color: 'var(--color-teal-dark)',
      }}>
        <p>Powered by Asymmetrica Protocol & Vedic Mathematics</p>
      </footer>
    </div>
  );
};

export default App;