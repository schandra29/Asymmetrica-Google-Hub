import { EmbeddingVector, Quaternion } from '@deep-sensing/shared';
import { reduceToQuaternion } from '../utils/dimension-reducer';

/**
 * @class QuaternionEncoder
 * @description A service class for encoding high-dimensional embedding vectors
 * into 4D quaternions. This class encapsulates the dimensionality reduction
 * logic and provides a clear interface for this transformation.
 *
 * @remarks
 * The encoder is a key component of the RAG pipeline, enabling significant
 * storage reduction and efficient similarity searches in a lower-dimensional space.
 * It adheres to the Asymmetrica Protocol by providing clear documentation and
 * evidence-based transformation logic.
 */
export class QuaternionEncoder {
  /**
   * Encodes a 768-dimensional embedding vector into a 4D quaternion.
   *
   * @param vector - The high-dimensional embedding vector.
   * @returns The resulting 4D quaternion.
   *
   * @remarks
   * This method leverages the `reduceToQuaternion` utility, which is inspired by
   * the Vedic Nikhilam method for simplifying complex numerical structures. The
   * reduction is deterministic and ensures that the quaternion representation
   * maintains the semantic essence of the original embedding.
   *
   * @complexity O(n), where n is the number of dimensions in the input vector (768).
   * @lineage Follows the Conceptual Distillation Workflow pattern.
   */
  public encode(vector: EmbeddingVector): Quaternion {
    try {
      return reduceToQuaternion(vector);
    } catch (error) {
      // In a real-world scenario, you might want to log this error
      // using a structured logger like Pino.
      console.error("Quaternion encoding failed:", error);
      throw new Error("Failed to encode vector to quaternion.");
    }
  }
}

// To maintain consistency with a potential dependency injection system in the future,
// we can export a singleton instance of the encoder.
export const quaternionEncoder = new QuaternionEncoder();