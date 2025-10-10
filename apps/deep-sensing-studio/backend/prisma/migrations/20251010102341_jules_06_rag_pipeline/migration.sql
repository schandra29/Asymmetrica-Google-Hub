-- Step 1: Add the new 'source_url' column to the "Document" table.
-- This column is needed by the RAG pipeline to provide source links.
ALTER TABLE "Document" ADD COLUMN "source_url" TEXT;

-- Step 2: Remove the old 'embedding' column from the "Document" table.
-- This column is now obsolete as embeddings are stored as quaternions
-- in the separate "Embedding" table, which provides better normalization.
ALTER TABLE "Document" DROP COLUMN "embedding";

-- Step 3: Create the custom PostgreSQL function for quaternion similarity.
-- This function is the core of the efficient, in-database semantic search.
--
-- Function: quaternion_similarity(q1 JSONB, q2 JSONB)
-- Returns: FLOAT
--
-- @remarks
-- Calculates similarity based on the Euclidean distance in 4D space,
-- normalized to a score where 1 is identical and 0 is infinitely distant.
-- Formula: 1 / (1 + sqrt((a1-a2)^2 + (b1-b2)^2 + (c1-c2)^2 + (d1-d2)^2))

CREATE OR REPLACE FUNCTION quaternion_similarity(q1 JSONB, q2 JSONB)
RETURNS FLOAT AS $$
DECLARE
    dist FLOAT;
    a1 FLOAT;
    bi1 FLOAT;
    cj1 FLOAT;
    dk1 FLOAT;
    a2 FLOAT;
    bi2 FLOAT;
    cj2 FLOAT;
    dk2 FLOAT;
BEGIN
    -- Extract components from the first quaternion
    a1 := (q1->>'a')::FLOAT;
    bi1 := (q1->>'bi')::FLOAT;
    cj1 := (q1->>'cj')::FLOAT;
    dk1 := (q1->>'dk')::FLOAT;

    -- Extract components from the second quaternion
    a2 := (q2->>'a')::FLOAT;
    bi2 := (q2->>'bi')::FLOAT;
    cj2 := (q2->>'cj')::FLOAT;
    dk2 := (q2->>'dk')::FLOAT;

    -- Calculate Euclidean distance
    dist := sqrt(
        power(a1 - a2, 2) +
        power(bi1 - bi2, 2) +
        power(cj1 - cj2, 2) +
        power(dk1 - dk2, 2)
    );

    -- Convert distance to similarity score
    RETURN 1 / (1 + dist);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 4: Add a GiST index on the quaternion column for performance.
-- This index type is well-suited for spatial data and will accelerate
-- the similarity search queries.
CREATE INDEX "embedding_quaternion_idx" ON "Embedding" USING GIST ("quaternion");