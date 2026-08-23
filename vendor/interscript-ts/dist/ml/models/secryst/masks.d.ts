/**
 * Attention masks for the Secryst transformer.
 *
 * Port of the mask construction logic from
 * `secryst/lib/secryst/translator.rb`.
 *
 * The transformer needs three mask types:
 *   - tgt_mask: causal mask (lower-triangular) prevents attending to future positions
 *   - src_key_padding_mask: marks padding tokens in the source
 *   - tgt_key_padding_mask: marks padding tokens in the target
 *   - memory_key_padding_mask: same as src_key_padding_mask
 */
import type { Tensor } from "../../types.js";
/**
 * Build a causal (lower-triangular) attention mask.
 * Shape: [seq_len, seq_len]. 1 = allowed, 0 = masked.
 *
 * Port of: Numo::DFloat.ones(n,n).triu.transpose.eq(0)
 * → upper triangular of ones → transpose → lower triangular → negate
 */
export declare function causalMask(seqLen: number): Uint8Array;
/**
 * Build a padding mask from a token ID sequence.
 * Pad ID = 1 in secryst (matching the Ruby code).
 * Shape: [batch, seq_len]. 1 = real token, 0 = padding.
 */
export declare function paddingMask(tokens: readonly number[], padId?: number): Uint8Array;
/**
 * Construct all masks needed for one inference step.
 * Returns tensors in the format the ONNX model expects.
 */
export declare function buildMasks(srcLen: number, tgtLen: number, srcIds: readonly number[], tgtIds: readonly number[]): Record<string, Tensor>;
//# sourceMappingURL=masks.d.ts.map