/**
 * Item compilation — convert AST Items into RegExp source or literal string.
 *
 * Items are decomposed into their compiled form ONCE per stage, then
 * reused across many string inputs. This avoids redundant work and
 * keeps the interpreter's inner loop tight (DRY + performance).
 */
import type { Item } from "../types.js";
import type { ExecutionContext } from "./context.js";
/** Compiled form of a pattern Item. */
export interface CompiledItem {
    /** RegExp source. */
    readonly re: string;
    /** Literal value (for replacement strings). */
    readonly literal: string;
}
/**
 * Compile an Item into a RegExp source string + literal value.
 * Visitor-free dispatch — adding a new Item kind = adding a case here.
 *
 * Note: this is intentionally a single switch with exhaustive type
 * coverage. New Item kinds force this switch to be updated, which is
 * good — it surfaces the change rather than hiding it.
 */
export declare function compileItem(item: Item, ctx: ExecutionContext): CompiledItem;
/**
 * Compile an Item to a literal string only (no regex semantics).
 * Used by the parallel-replace executor which needs exact strings.
 *
 * Returns `null` if the Item cannot be represented as a literal
 * (captures, regex-only constructs). The caller decides whether to
 * fall back to sequential execution.
 */
export declare function compileToLiteral(item: Item, ctx: ExecutionContext): string | null;
/**
 * Expand a `from` item into ALL possible literal strings for parallel
 * replace. `any` items produce one entry per alternative. Other items
 * produce a single entry (or null if not literal).
 *
 * This is the multi-valued counterpart of `compileToLiteral`.
 */
export declare function expandFromLiterals(item: Item, ctx: ExecutionContext): string[] | null;
/**
 * Compute the max-length estimate for an Item. Mirrors Ruby's
 * `Node::Item#max_length`, which is used to sort parallel rules
 * (longest first) before building the megaregexp fallback.
 *
 * The estimate need not be exact — it only governs sort order within
 * a parallel block. Stdlib aliases count as length 1 (matching Ruby),
 * `none` is 0.
 */
export declare function maxLengthOfItem(item: Item, ctx: ExecutionContext): number;
//# sourceMappingURL=compile-item.d.ts.map