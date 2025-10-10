# Deep-Sensing Studio: Database Schema

This directory contains the Prisma schema, migrations, and seed script for the Deep-Sensing Studio's PostgreSQL database. The schema is the single source of truth for the application's data models.

**Author:** JULES-03

## 1. Schema Overview

The schema is defined in `schema.prisma` and is designed to support the core functionalities of the Deep-Sensing Studio: document ingestion, analysis, and retrieval. It follows the principles of the **Asymmetrica Protocol**, incorporating a **Three-Regime Architecture** and support for **Quaternion Embeddings**.

### Key Design Principles:
- **Relational Integrity:** Foreign key constraints are used to maintain consistency between related models (e.g., a `Document` and its `Entities`).
- **Performance:** Indexes are strategically applied to optimize common query patterns, such as filtering by regime, sorting by date, and searching within JSONB data.
- **Scalability:** The use of `cuid` for primary keys and a clear sharding key (`regime` on the `Document` model) provides a foundation for future scaling.

## 2. Data Models

The schema consists of the following models:

### `Document`
The central model representing an ingested piece of text.
- `id`: Unique identifier (`cuid`).
- `content`: The full text of the document.
- `structured_data`: A `JSONB` field for storing extracted metadata, such as NER results.
- `embedding`: A `JSONB` field for the 4D quaternion vector, enabling efficient storage.
- `confidence`: A float representing the harmonic mean confidence score of the document's analysis.
- `regime`: An enum (`Support`, `Exploration`, `Balance`) used for classification and data sharding.

### `Entity`
Represents a named entity (e.g., person, organization) extracted from a `Document`.
- `id`: Unique identifier (`cuid`).
- `document_id`: A foreign key linking to the parent `Document`.
- `entity_type`: The type of entity (e.g., "PERSON", "GPE").
- `entity_value`: The text of the entity.
- `confidence`, `position_start`, `position_end`: Metadata about the extraction.

### `Sentiment`
Represents the sentiment analysis result for a `Document`.
- `id`: Unique identifier (`cuid`).
- `document_id`: A foreign key linking to the parent `Document`.
- `sentiment_score`: A float from -1.0 (negative) to 1.0 (positive).
- `sentiment_label`: An enum (`positive`, `negative`, `neutral`).
- `confidence`: The confidence score of the sentiment analysis.

### `Embedding`
Stores additional or historical quaternion embeddings for a `Document`.
- `id`: Unique identifier (`cuid`).
- `document_id`: A foreign key linking to the parent `Document`.
- `quaternion`: A `JSONB` field storing the 4D vector.

### `User`
A model for future user authentication and API key management (Phase 2).
- `id`: Unique identifier (`cuid`).
- `email`: The user's unique email address.
- `name`: The user's name.
- `api_key_hash`: A hash of the user's API key.

## 3. Relationships

- **One-to-Many:** A `Document` can have many `Entities`, `Sentiments`, and `Embeddings`.
- **On-Delete Cascade:** If a `Document` is deleted, all its associated child records (entities, sentiments, embeddings) are automatically deleted to maintain data integrity.

## 4. Indexing Strategy

To ensure high-performance queries, the following indexes are defined:
- **`Document(regime)`**: Speeds up filtering and querying documents by their classified regime. This is critical for the Three-Regime Architecture.
- **`Document(created_at)`**: Optimizes sorting documents by their creation date.
- **`Document(structured_data)`**: A **GIN (Generalized Inverted Index)** is used on this `JSONB` field. This allows for highly efficient searches for documents containing specific keys or values within their metadata.
- **Foreign Key Indexes**: Prisma automatically creates indexes on foreign key fields (`document_id` in child tables), which significantly speeds up joins and retrieving related data.
- **Quaternion GiST Index (Future)**: A GiST (Generalized Search Tree) index is recommended for accelerating similarity searches on quaternion embeddings. This requires a custom SQL function and migration, which is planned for the RAG pipeline implementation (JULES-06).

## 5. Usage

### Generating Migrations
To generate a new migration after changing `schema.prisma`:
```bash
# From the backend directory (apps/deep-sensing-studio/backend)
npx prisma migrate dev --name your-migration-name
```

### Seeding the Database
To populate the database with sample data for testing:
```bash
# From the backend directory
npm run prisma:seed
```
The seed script (`seed.ts`) is idempotent. It will clean up existing data before populating the tables with 1,000 sample documents and their relations.