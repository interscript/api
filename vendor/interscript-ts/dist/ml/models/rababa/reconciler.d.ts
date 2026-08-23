/**
 * Reconciler — port of `rababa/lib/rababa/arabic/reconciler.rb`.
 *
 * Given:
 *   - strOriginal:  original text including digits, punctuation, etc.
 *   - strDiacritized: model output (Arabic letters + haraqat only;
 *     non-Arabic chars dropped by the encoder)
 *
 * Produce a merged string where:
 *   - Arabic letters from `strOriginal` get the haraqat from the
 *     matching position in `strDiacritized`
 *   - Non-Arabic chars from `strOriginal` are preserved at their
 *     original positions
 *
 * The Ruby algorithm:
 *   1. Build pivot map: pairs of (idx_dia, idx_ori) where the chars match
 *   2. Walk both strings, emitting chars from original until next pivot,
 *      then chars from diacritized until next pivot, then the matched
 *      char itself
 *   3. Finalize: remaining diacritized chars, then remaining original chars
 *
 * Direct port — same shape, same edge cases.
 */
/**
 * Merge original + diacritized into the final output. Direct port of
 * `reconcile_strings`.
 */
export declare function reconcileStrings(strOriginal: string, strDiacritized: string): string;
//# sourceMappingURL=reconciler.d.ts.map