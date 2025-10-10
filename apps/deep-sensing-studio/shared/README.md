# @deep-sensing/shared

**Shared TypeScript types for Deep-Sensing Studio**

This package provides type-safe interfaces for both backend and frontend, ensuring consistency across the entire Deep-Sensing Studio application.

## Features

- **Complete Prisma Schema Types**: All database models exported as TypeScript interfaces
- **Three-Regime Classification**: Asymmetrica Protocol ordinal hierarchy types
- **Vedic Mathematics Types**: Quaternion, Williams Space Optimizer, Harmonic Timer
- **API Contracts**: Request/Response interfaces for frontend-backend communication
- **Strict Type Safety**: Compiled with strict TypeScript settings
- **CommonJS Compatible**: Works with any npm version (no workspace syntax!)

## Installation

This package is installed automatically when you run `npm install` from the root directory.

### Manual Installation

If needed, you can install directly:

```bash
# From backend or frontend directory
npm install file:../shared

# Or from the root directory
npm install
```

## Usage

### In Backend (Node.js + TypeScript)

```typescript
import { Document, Regime, Quaternion, DocumentUploadRequest } from '@deep-sensing/shared';

// Using Prisma model types
const document: Document = {
  id: 'cuid_abc123',
  content: 'Sample document content',
  structured_data: { entities: [] },
  confidence: 0.95,
  regime: Regime.Support,
  created_at: new Date(),
  updated_at: new Date(),
};

// Using API request types
const uploadRequest: DocumentUploadRequest = {
  content: 'Document to process',
  filename: 'sample.txt',
  metadata: { source: 'upload' },
};
```

### In Frontend (React + TypeScript)

```typescript
import {
  DocumentResponse,
  Regime,
  Quaternion,
  DocumentUploadRequest
} from '@deep-sensing/shared';

// Type-safe API requests
async function uploadDocument(content: string): Promise<DocumentResponse> {
  const request: DocumentUploadRequest = {
    content,
    filename: 'user-upload.txt',
  };

  const response = await fetch('/api/documents', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return response.json() as Promise<DocumentResponse>;
}

// Type-safe state management
interface AppState {
  documents: DocumentResponse[];
  currentRegime: Regime;
}
```

## Available Types

### Core Models (from Prisma Schema)

- `Document` - Core document model with content, confidence, regime
- `Entity` - Named Entity Recognition (NER) results
- `Sentiment` - Sentiment analysis results
- `SentimentLabel` - Enum: 'positive' | 'negative' | 'neutral'
- `Embedding` - Quaternion embedding storage
- `User` - User model for Phase 2 authentication
- `DocumentWithRelations` - Document with all relations included

### Three-Regime Classification

- `Regime` - Enum: Support | Exploration | Balance
- `RegimeClassification` - Classification result with confidence
- `ThreeRegimeDistribution` - Distribution statistics
- `RegimeTestDistribution` - QA test distribution (30/20/50)
- `RegimeTestWeights` - Test confidence weights (0.7/0.85/1.0)
- `THREE_REGIME_TEST_CONFIG` - Constants for DefenseKit integration
- `REGIME_LEVERAGE` - Empirically validated leverage factors

### Vedic Mathematics

- `Quaternion` - 4D vector: {a, bi, cj, dk}
- `HarmonicMeanResult` - Harmonic mean computation result
- `DharmaIndexResult` - Vedic-inspired quality metric
- `QuaternionSimilarity` - Similarity search result
- `VedicOptimizationStats` - Performance tracking
- `WilliamsSpaceResult` - Williams Space Optimizer result (√t × log₂(t))
- `HarmonicTimerConfig` - Tesla 4.909 Hz timing configuration
- `DEFAULT_HARMONIC_CONFIG` - Default Tesla timing constants

### API Request Types

- `DocumentUploadRequest` - Upload new document
- `EntityRecognitionRequest` - Request NER analysis
- `SentimentAnalysisRequest` - Request sentiment analysis
- `BatchProcessingRequest` - Batch job submission
- `QuaternionSimilarityRequest` - Similarity search query
- `DocumentQueryRequest` - Document filtering/pagination

### API Response Types

- `DocumentResponse` - Single document response
- `DocumentWithRelationsResponse` - Document with entities/sentiments/embeddings
- `EntityRecognitionResponse` - NER results
- `SentimentAnalysisResponse` - Sentiment results
- `BatchProcessingResponse` - Batch job status
- `QuaternionSimilarityResponse` - Similarity search results
- `PaginatedResponse<T>` - Generic paginated wrapper
- `ErrorResponse` - RFC 7807 error format
- `HealthCheckResponse` - Service health status
- `StatisticsResponse` - System statistics

### WebSocket Types

- `WebSocketMessage` - Base WebSocket message
- `DocumentProcessingEvent` - Real-time document processing updates
- `BatchJobEvent` - Real-time batch job updates

## Building

After making changes to the types, rebuild the package:

```bash
# From the shared directory
npm run build

# Or from the root directory
npm run build:shared
```

This compiles TypeScript to CommonJS in the `dist/` folder with declaration files (.d.ts).

## Development Workflow

### 1. Add a New Type

Edit the appropriate file in `src/types/`:

- `document.ts` - Database models
- `regime.ts` - Three-Regime types
- `vedic.ts` - Vedic math types
- `api.ts` - API request/response types

### 2. Export the Type

Make sure the type is exported in `src/types/index.ts` (already a barrel export).

### 3. Rebuild

```bash
npm run build
```

### 4. Use in Backend/Frontend

Types are automatically available after rebuild:

```typescript
import { YourNewType } from '@deep-sensing/shared';
```

## Examples

### Example 1: Creating a Document

```typescript
import { Document, Regime } from '@deep-sensing/shared';

const newDocument: Document = {
  id: 'cuid_new_doc',
  content: 'The quick brown fox jumps over the lazy dog.',
  structured_data: {
    entities: [
      { type: 'ANIMAL', value: 'fox' },
      { type: 'ANIMAL', value: 'dog' },
    ],
  },
  confidence: 0.92,
  regime: Regime.Support,
  created_at: new Date(),
  updated_at: new Date(),
};
```

### Example 2: Three-Regime Classification

```typescript
import { Regime, RegimeClassification, REGIME_LEVERAGE } from '@deep-sensing/shared';

function classifyDocument(confidence: number): RegimeClassification {
  let regime: Regime;

  if (confidence >= 0.85) {
    regime = Regime.Support; // High confidence
  } else if (confidence < 0.65) {
    regime = Regime.Exploration; // Low confidence, exploratory
  } else {
    regime = Regime.Balance; // Medium confidence
  }

  return {
    regime,
    confidence,
    reasoning: `Leverage factor: ${REGIME_LEVERAGE[regime]}x`,
  };
}
```

### Example 3: Quaternion Similarity Search

```typescript
import {
  Quaternion,
  QuaternionSimilarityRequest,
  QuaternionSimilarityResponse
} from '@deep-sensing/shared';

const searchQuaternion: Quaternion = {
  a: 0.5,
  bi: 0.3,
  cj: 0.2,
  dk: 0.1,
};

const searchRequest: QuaternionSimilarityRequest = {
  source: searchQuaternion,
  limit: 10,
  threshold: 0.75,
  metric: 'cosine',
};

// API call would return:
const searchResults: QuaternionSimilarityResponse = {
  source_quaternion: searchQuaternion,
  results: [
    {
      document_id: 'doc_123',
      similarity: 0.95,
      regime: Regime.Support,
      confidence: 0.90,
    },
    // ... more results
  ],
  processing_time_ms: 42,
};
```

### Example 4: Williams Space Optimizer

```typescript
import { WilliamsSpaceResult } from '@deep-sensing/shared';

function calculateWilliamsSpace(timeComplexity: number): WilliamsSpaceResult {
  const spaceBound = Math.sqrt(timeComplexity) * Math.log2(timeComplexity);
  const efficiencyMultiplier = timeComplexity / spaceBound;
  const spaceReductionPercent = ((timeComplexity - spaceBound) / timeComplexity) * 100;

  return {
    time_complexity: timeComplexity,
    space_bound: spaceBound,
    efficiency_multiplier: efficiencyMultiplier,
    space_reduction_percent: spaceReductionPercent,
  };
}

// Example: 10,000 operations
// Result: 7.5x efficiency, 87% space reduction
const result = calculateWilliamsSpace(10000);
console.log(`Efficiency: ${result.efficiency_multiplier.toFixed(1)}x`);
console.log(`Space saved: ${result.space_reduction_percent.toFixed(0)}%`);
```

### Example 5: Harmonic Timer (Tesla 4.909 Hz)

```typescript
import { DEFAULT_HARMONIC_CONFIG } from '@deep-sensing/shared';

function scheduleWithHarmonic(retryAttempt: number): number {
  const { base_period_ms, backoff_multipliers } = DEFAULT_HARMONIC_CONFIG;
  const multiplier = backoff_multipliers[Math.min(retryAttempt, backoff_multipliers.length - 1)];
  return base_period_ms * multiplier;
}

// Retry schedule (Tesla harmonics):
// Attempt 0: ~204ms (1× harmonic)
// Attempt 1: ~408ms (2× harmonic)
// Attempt 2: ~815ms (4× harmonic)
// Attempt 3: ~1630ms (8× harmonic)
// Attempt 4: ~3260ms (16× harmonic)
```

## Testing

The shared package itself doesn't have tests (it's just types), but you should test usage in backend/frontend:

```typescript
// In backend or frontend tests
import { Document, Regime } from '@deep-sensing/shared';

describe('Type Safety', () => {
  it('should enforce Document structure', () => {
    const doc: Document = {
      id: 'test_id',
      content: 'test content',
      structured_data: {},
      confidence: 0.95,
      regime: Regime.Support,
      created_at: new Date(),
      updated_at: new Date(),
    };

    expect(doc.regime).toBe(Regime.Support);
    expect(doc.confidence).toBeGreaterThan(0.9);
  });
});
```

## Architecture Notes

### Why CommonJS?

- **Compatibility**: Works with any npm version without workspace syntax issues
- **Universal**: Both ESM (frontend) and CommonJS (backend) can import
- **Stability**: Mature module system with wide tooling support

### Why file: Protocol?

The backend and frontend reference this package via `file:../shared` instead of `workspace:*`:

- **No npm workspace limitations**: Works with older npm versions
- **Explicit dependency**: Clear relationship between packages
- **Simpler debugging**: No mysterious workspace resolution issues

### Type Generation Strategy

Instead of using `prisma generate` types directly, we manually define TypeScript interfaces:

- **Decoupling**: Frontend doesn't need Prisma Client
- **Simplicity**: Pure TypeScript, no runtime dependencies
- **Flexibility**: Can add computed properties, helpers, etc.

## Troubleshooting

### "Cannot find module '@deep-sensing/shared'"

1. Make sure you've run `npm install` from the root directory
2. Verify the shared package is built: `cd shared && npm run build`
3. Check that `node_modules/@deep-sensing/shared` exists

### Types are outdated after Prisma schema changes

1. Update the corresponding TypeScript interface in `src/types/document.ts`
2. Rebuild: `npm run build`
3. Restart your dev server (backend or frontend)

### "Module not found" in production

Make sure the `dist/` folder is included in your deployment. Run `npm run build:shared` before deploying.

## Contributing

When adding new types:

1. **Follow naming conventions**: PascalCase for interfaces, camelCase for properties
2. **Add JSDoc comments**: Explain what each type represents
3. **Keep it pure**: No runtime code, only type definitions
4. **Update this README**: Add examples for new types
5. **Rebuild and test**: Verify both backend and frontend can import

## License

UNLICENSED - Internal use only for Asymmetrica Deep-Sensing Studio

## Support

For questions or issues with shared types, contact the Asymmetrica team or create an issue in the project repository.

---

**Version:** 1.0.0
**Last Updated:** October 10, 2025
**Maintained by:** Agent BRAVO (Asymmetrica Intelligence)

**Asymmetrica Protocol Compliance:** This package adheres to evidence-based development practices with empirically validated patterns (Williams Space Optimizer, Three-Regime distribution, Tesla Harmonic timing).
