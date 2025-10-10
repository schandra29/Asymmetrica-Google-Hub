# Deep-Sensing Studio - Frontend

**React 19 + TypeScript + Vite** frontend for the Deep-Sensing Studio.

## 🎯 Overview

This frontend provides:
- **Landing Page** - Asymmetrica branding with embedded Swagger UI
- **Insight Lens** - Document upload and visualization
- **Data Cards** - Entity and sentiment display
- **System Health Gauge** - Confidence scoring visualization
- **PHI-based Design** - Golden Ratio spacing and layout
- **Tesla Harmonic Animations** - 4.909 Hz timing

## 🚀 Quick Start

### **Install Dependencies**

```bash
npm install
```

### **Start Development Server**

```bash
npm run dev
```

App will start on `http://localhost:5173`.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run UX-Sonar tests (WCAG, visual regression)
npm run test:ux-sonar

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 🏗️ Directory Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── Landing.tsx     # Landing page with Swagger UI
│   │   └── InsightLens.tsx # Document upload & visualization
│   ├── components/         # Reusable components
│   │   ├── Upload.tsx      # Drag-drop upload
│   │   ├── DataCards.tsx   # Entity/sentiment cards
│   │   └── SystemHealthGauge.tsx # Confidence gauge
│   ├── styles/             # CSS
│   │   ├── tokens.css      # Design tokens (PHI-based)
│   │   └── animations.css  # Tesla harmonic animations
│   ├── utils/              # Frontend utilities
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
└── tests/
    ├── ux-sonar/           # Accessibility & visual regression
    └── e2e/                # End-to-end tests
```

## ⚙️ Configuration

### **Environment Variables (.env)**

```env
VITE_API_URL="http://localhost:3000/api"
```

### **Tailwind Config (tailwind.config.js)**

Custom colors, spacing, and animations configured with:
- Asymmetrica brand colors (Teal, Orange, Navy, Gold, Cream)
- PHI-based spacing scale (0.382rem - 4.236rem)
- Tesla harmonic animations (203.7ms, 407.4ms, 814.8ms)

## 🎨 Design System

### **Colors**

```css
--asymmetrica-teal: #00CED1;      /* Primary */
--asymmetrica-orange: #FF8C42;    /* Accent */
--asymmetrica-navy: #1B2A4A;      /* Background */
--asymmetrica-gold: #FFD700;      /* Highlights */
--asymmetrica-cream: #FFF8E7;     /* Text */
```

### **Spacing (PHI-based)**

```css
--space-phi-xs: 0.382rem;   /* 6.112px */
--space-phi-sm: 0.618rem;   /* 9.888px */
--space-phi-md: 1rem;       /* 16px (base) */
--space-phi-lg: 1.618rem;   /* 25.888px */
--space-phi-xl: 2.618rem;   /* 41.888px */
--space-phi-2xl: 4.236rem;  /* 67.776px */
```

### **Animations (Tesla 4.909 Hz)**

```css
--tesla-period: 203.7ms;     /* 1× harmonic */
--tesla-2x: 407.4ms;         /* 2× harmonic */
--tesla-4x: 814.8ms;         /* 4× harmonic */
--tesla-8x: 1629.6ms;        /* 8× harmonic */
```

## ♿ Accessibility (WCAG 2.1 AA)

**All components are:**
- Keyboard navigable
- Screen reader compatible
- Color contrast compliant (4.5:1 text, 3:1 UI)
- Semantic HTML
- ARIA labeled where needed

**Tested with:**
- axe-core (automated accessibility testing)
- Playwright (keyboard navigation)
- NVDA/VoiceOver (screen readers)

## 📊 Performance Targets

- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 100
- Animation frame rate: 60fps (Tesla throttled)

## 🚀 Deployment

### **Build for Production**

```bash
npm run build
```

Output: `dist/` directory

### **Preview Production Build**

```bash
npm run preview
```

### **Deploy to Render.com**

Static site deployment (automated via GitHub Actions).

---

**JULES Agents:** JULES-02, JULES-04, JULES-07, JULES-08
**Updated:** October 10, 2025
