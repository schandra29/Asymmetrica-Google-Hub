import { QuaternionEncoder } from '../../src/services/quaternion-encoder';
import { EmbeddingVector, Quaternion } from '@deep-sensing/shared';

describe('QuaternionEncoder', () => {
  let encoder: QuaternionEncoder;

  beforeEach(() => {
    encoder = new QuaternionEncoder();
  });

  /**
   * @test {QuaternionEncoder.encode}
   * @description Stabilization Test: Ensures a valid 768D vector is correctly encoded.
   */
  it('should encode a 768D vector into a 4D quaternion', () => {
    // Arrange: Create a mock 768D vector of all 1s.
    const vector: EmbeddingVector = Array(768).fill(1.0);
    const segmentAverage = 1.0; // The average of each 192-element segment of 1s is 1.

    // Act
    const quaternion: Quaternion = encoder.encode(vector);

    // Assert
    expect(quaternion).toBeDefined();
    expect(quaternion.a).toBe(segmentAverage);
    expect(quaternion.bi).toBe(segmentAverage);
    expect(quaternion.cj).toBe(segmentAverage);
    expect(quaternion.dk).toBe(segmentAverage);
  });

  /**
   * @test {QuaternionEncoder.encode}
   * @description Exploration Test: Ensures the encoder throws an error for invalid input dimensions.
   */
  it('should throw an error if the vector is not 768 dimensions', () => {
    // Arrange: Create a vector with an incorrect number of dimensions.
    const invalidVector: EmbeddingVector = Array(100).fill(0);

    // Act & Assert
    expect(() => encoder.encode(invalidVector)).toThrow('Input vector must have 768 dimensions, but received 100.');
  });

  /**
   * @test {QuaternionEncoder.encode}
   * @description Stabilization Test: Verifies that the encoding process is deterministic.
   */
  it('should produce the same quaternion for the same input vector', () => {
    // Arrange: Create a sample 768D vector with random-like data.
    const vector: EmbeddingVector = Array.from({ length: 768 }, (_, i) => Math.sin(i * 0.1));

    // Act
    const quaternion1 = encoder.encode(vector);
    const quaternion2 = encoder.encode(vector);

    // Assert
    expect(quaternion1).toEqual(quaternion2);
  });

  /**
   * @test {QuaternionEncoder.encode}
   * @description Optimization Test: Checks encoding with a more complex vector.
   */
  it('should correctly calculate averages for a mixed-value vector', () => {
    // Arrange: Create a vector where each segment has a different, predictable average.
    const vector: EmbeddingVector = [
      ...Array(192).fill(0.1), // Segment 1 average: 0.1
      ...Array(192).fill(0.2), // Segment 2 average: 0.2
      ...Array(192).fill(0.3), // Segment 3 average: 0.3
      ...Array(192).fill(0.4), // Segment 4 average: 0.4
    ];

    // Act
    const quaternion = encoder.encode(vector);

    // Assert
    expect(quaternion.a).toBeCloseTo(0.1);
    expect(quaternion.bi).toBeCloseTo(0.2);
    expect(quaternion.cj).toBeCloseTo(0.3);
    expect(quaternion.dk).toBeCloseTo(0.4);
  });
});