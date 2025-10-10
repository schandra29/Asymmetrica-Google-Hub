-- =================================================================
-- Asymmetrica Protocol: MathAlive Function Definition
--
-- Function: quaternion_similarity(q1 JSONB, q2 JSONB)
-- Returns: FLOAT
--
-- @remarks
-- This function calculates the similarity between two 4D quaternions
-- stored as JSONB objects in PostgreSQL. The similarity is derived
-- from the Euclidean distance in 4D space, normalized to a score
-- between 0 and 1. A score of 1 indicates identical quaternions.
--
-- The formula for Euclidean distance in 4D is:
-- d = sqrt((a1-a2)^2 + (b1-b2)^2 + (c1-c2)^2 + (d1-d2)^2)
--
-- The similarity score is then calculated as:
-- similarity = 1 / (1 + d)
--
-- This ensures that as the distance approaches 0, the similarity
-- approaches 1.
--
-- @complexity
-- The complexity is O(1) as it performs a fixed number of
-- arithmetic operations.
--
-- @lineage
-- This is a direct implementation of the mathematical definition of
-- quaternion distance, adapted for use within PostgreSQL.
-- =================================================================

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