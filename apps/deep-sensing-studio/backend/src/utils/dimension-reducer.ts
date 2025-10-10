import { EmbeddingVector, Quaternion } from '@deep-sensing/shared';

/**
 * @remarks
 * This module implements the dimensionality reduction from a 768D embedding vector
 * to a 4D quaternion. The reduction is inspired by the Vedic Nikhilam Sutra,
 * which simplifies complex calculations. Here, we adapt the principle by dividing
 * the high-dimensional space into four segments and calculating a representative
 * value for each, forming the components of the quaternion.
 *
 * The 768 dimensions are split into four equal 192-dimension segments. The average
 * of the values in each segment is computed to generate the a, bi, cj, and dk
 * components of the quaternion. This method provides a balanced and stable
 * reduction, ensuring that each part of the original vector contributes equally
 * to the resulting quaternion.
 */

/**
 * Reduces a 192-dimensional vector segment to a single scalar value.
 * This is achieved by calculating the arithmetic mean of the segment's elements,
 * providing a stable and representative value for the segment.
 *
 * @param segment - A 192-element array of numbers.
 * @returns The average of the segment's elements.
 * @private
 */
const reduceSegment = (segment: number[]): number => {
  if (segment.length === 0) {
    return 0;
  }
  const sum = segment.reduce((acc, val) => acc + val, 0);
  return sum / segment.length;
};

/**
 * Reduces a 768D embedding vector to a 4D quaternion.
 * The input vector is partitioned into four 192D segments, and each segment
 * is reduced to a single scalar value that becomes a component of the quaternion.
 *
 * @param vector - The 768D embedding vector to be reduced.
 * @returns A 4D quaternion representation {a, bi, cj, dk}.
 * @throws {Error} If the input vector is not 768 dimensions.
 *
 * @complexity O(n) where n is the number of dimensions in the vector (768).
 * @lineage Inspired by Vedic Nikhilam method for simplification.
 */
export const reduceToQuaternion = (vector: EmbeddingVector): Quaternion => {
  const expectedDimensions = 768;
  if (vector.length !== expectedDimensions) {
    throw new Error(`Input vector must have ${expectedDimensions} dimensions, but received ${vector.length}.`);
  }

  const segmentLength = expectedDimensions / 4; // 192

  const a = reduceSegment(vector.slice(0, segmentLength));
  const bi = reduceSegment(vector.slice(segmentLength, segmentLength * 2));
  const cj = reduceSegment(vector.slice(segmentLength * 2, segmentLength * 3));
  const dk = reduceSegment(vector.slice(segmentLength * 3, segmentLength * 4));

  return { a, bi, cj, dk };
};