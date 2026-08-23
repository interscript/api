/**
 * Rule executors — one pure function per Rule kind.
 *
 * Adding a new Rule kind:
 *   1. Add a variant to `Rule` in `types.ts`
 *   2. Register an executor here via the `executors` map
 *
 * Existing executors never need to change (OCP).
 */
import type { Item, Rule } from "../types.js";
import type { ExecutionContext } from "./context.js";
type RuleKind = Rule["kind"];
/** Dispatch a Rule to its registered executor. O(1) lookup. */
export declare function executeRule<K extends RuleKind>(rule: Extract<Rule, {
    kind: K;
}>, ctx: ExecutionContext): void;
export type { Item };
//# sourceMappingURL=executor.d.ts.map