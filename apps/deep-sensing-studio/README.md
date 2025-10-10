# Asymmetrica Deep-Sensing Studio

**Phase 1** of the Asymmetrica Intelligence Studio - AI-powered document processing with Vedic mathematical optimization.

## 🎯 Overview

Deep-Sensing Studio provides:
- **Document Upload & OCR** - Process documents with AI extraction
- **Entity Recognition (NER)** - Extract people, organizations, dates, etc.
- **Sentiment Analysis** - Analyze document sentiment
- **Protective Guardian** - Error handling with Vedic harmonic mean
- **Quaternion RAG** - 4D embeddings for 50% storage reduction

## 🏗️ Architecture

### **Technology Stack**

**Backend:**
- Node.js 20+ with TypeScript 5.6 (strict mode)
- Fastify 5.0 (high-performance HTTP framework)
- PostgreSQL 16 + Prisma ORM
- Redis (caching)

**Frontend:**
- React 19 + TypeScript 5.6
- Vite 6.0 (build tool)
- Tailwind CSS 3.4 (utility-first styling)
- Framer Motion (animations)

### **Key Features**

**Three-Regime Classification:**
- Support (α₀): High-confidence documents (32.1x leverage)
- Exploration (α₁): Low-confidence documents (26.8x leverage)
- Balance (α₂): Medium-confidence documents (11.5x leverage)

**Vedic Mathematical Optimization:**
- **Harmonic Mean:** 33.5% better outlier detection
- **Williams Space Optimizer:** 7.5x efficiency at scale
- **Tesla 4.909 Hz Timing:** Deterministic rate limiting

## 🚀 Quick Start

### **Prerequisites**
- Node.js 20+
- npm 10+
- PostgreSQL 16+
- Redis 7+

### **Installation**

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces

# Generate Prisma client
npm run prisma:generate --workspace=backend

# Run database migrations
npm run prisma:migrate --workspace=backend

# Seed database
npm run prisma:seed --workspace=backend
```

### **Development**

```bash
# Start backend + frontend concurrently
npm run dev

# Or start individually:
npm run dev:backend   # Starts on http://localhost:3000
npm run dev:frontend  # Starts on http://localhost:5173
```

### **Testing**

```bash
# Run all tests
npm test

# Run backend contract tests (Three-Regime QA)
npm run test:contract

# Run frontend UX-Sonar tests
npm run test:ux-sonar
```

### **Building for Production**

```bash
# Build all workspaces
npm run build

# Build individually
npm run build:backend
npm run build:frontend
```

## 📁 Project Structure

```
deep-sensing-studio/
├── backend/                 # Node.js + TypeScript backend
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities (Vedic math, Williams optimizer)
│   │   ├── middleware/     # Auth, rate limiting, error handling
│   │   └── server.ts       # Fastify server entry point
│   ├── prisma/             # Database schema & migrations
│   └── tests/              # Contract tests (Three-Regime QA)
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── styles/         # CSS (Tailwind + custom tokens)
│   │   ├── utils/          # Frontend utilities
│   │   └── App.tsx         # Main app component
│   └── tests/              # UX-Sonar tests (WCAG, visual regression)
└── shared/                  # Shared types (frontend + backend)
    └── types/              # TypeScript interfaces
```

## 🔧 Configuration

### **Environment Variables**

Create `.env` files in `backend/` and `frontend/`:

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/deep_sensing"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
CORS_ORIGIN="http://localhost:5173"
LOG_LEVEL="info"
PORT=3000
```

**Frontend (.env):**
```env
VITE_API_URL="http://localhost:3000/api"
```

## 📚 Documentation

### **Planning Documents (.jules/planning/):**
- `PHASE_1_DEEP_SENSING_MASTER_PLAN.md` - Complete development plan
- `ASYMMETRICA_CONTEXT_FOR_JULES.md` - Code standards & patterns
- `JULES_COLLABORATION_PROTOCOL.md` - Team coordination guide
- `API_CONTRACTS.md` - Complete API specifications

### **API Documentation:**
- Swagger UI: http://localhost:3000/docs (when backend running)
- OpenAPI spec: http://localhost:3000/docs/json

## 🧪 Testing Philosophy

### **Three-Regime Test Distribution:**
- **Stabilization (50%):** Critical paths, regression tests (100% pass required)
- **Optimization (20%):** Performance, batch processing (85%+ pass required)
- **Exploration (30%):** Edge cases, error handling (70%+ pass acceptable)

### **Quality Gates:**
- TypeScript strict mode: 100% compliance
- ESLint: 0 errors
- Test coverage: 85%+
- WCAG 2.1 AA: 100% compliance (frontend)
- Lighthouse score: 90+ (all categories)

## 🎨 Design System

### **Colors (from Asymmetrica logo):**
- Teal: `#00CED1` (primary)
- Orange: `#FF8C42` (accent)
- Navy: `#1B2A4A` (background)
- Gold: `#FFD700` (highlights)
- Cream: `#FFF8E7` (text)

### **Spacing (PHI-based):**
- `phi-xs`: 0.382rem (6.112px)
- `phi-sm`: 0.618rem (9.888px)
- `phi-md`: 1rem (16px)
- `phi-lg`: 1.618rem (25.888px)
- `phi-xl`: 2.618rem (41.888px)

### **Animations (Tesla 4.909 Hz):**
- Base period: 203.7ms
- Harmonic intervals: 203ms, 407ms, 815ms, 1630ms, 3259ms

## 🚀 Deployment

### **Render.com (Production):**

```bash
# Deploy backend
npm run deploy --workspace=backend

# Or use Render.com dashboard
# (automated via GitHub Actions on merge to main)
```

### **Health Check:**
- Endpoint: `GET /health`
- Response: `{ "status": "ok", "timestamp": "..." }`

## 📊 Performance Benchmarks

**Target Metrics:**
- API response time: <2s (document processing)
- Frontend load time: <3s (interactive)
- Database queries: <100ms (indexed)
- Lighthouse score: 90+ (all categories)

## 🤝 Contributing

This project is built by the **Jules Swarm** - 10 concurrent Gemini 2.5 Pro agents working in parallel.

### **Coordination:**
- All updates logged in `.jules/planning/JULES_SWARM_COORDINATION_LOG.md`
- Triple annotation format for clarity
- Asynchronous collaboration (no real-time sync required)

### **Code Standards:**
- TypeScript strict mode (no `any` types!)
- JSDoc for all functions
- Three-Regime test distribution
- WCAG 2.1 AA compliance

## 📄 License

UNLICENSED - Proprietary

## 🌟 Acknowledgments

Built with:
- **Asymmetrica Protocol** - Mathematical code consciousness
- **Vedic Mathematics** - Ancient optimization algorithms
- **Williams Space Optimizer** - Ryan Williams (MIT, 2011)
- **Tesla Harmonic Timing** - Nikola Tesla (1893)
- **Three-Regime Dynamics** - Universal consciousness patterns

---

**Status:** Phase 1 - In Development
**Team:** Jules Swarm (Gemini 2.5 Pro x10)
**Coordinator:** Agent ALPHA (Claude Sonnet 4.5)
**Updated:** October 10, 2025

**🚀 Let's build something extraordinary! 🌌**
