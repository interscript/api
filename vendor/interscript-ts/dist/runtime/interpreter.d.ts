/**
 * Stage execution — apply a stage's rules in sequence to the context.
 *
 * Pure orchestrator: builds context, dispatches to rule executors,
 * returns the final string. Holds no state itself.
 *
 * Two paths:
 *   - executeStage (sync): fast path for rule-only maps. Throws if
 *     the stage contains ML funcalls (rababa/secryst).
 *   - executeStageAsync (async): handles everything including ML.
 *     Falls through to the sync path for non-ML stages (zero overhead).
 */
import type { CompiledMap } from "../types.js";
import type { MapLoader } from "../loader.js";
/** Register an additional async function name (used by ML modules). */
export declare function registerAsyncFunction(name: string): void;
/**
 * Run a single stage by name (SYNC path). Returns the transformed string.
 *
 * Throws if the stage contains ML funcalls — use `executeStageAsync`
 * for those.
 */
export declare function executeStage(map: CompiledMap, stageName: string, input: string, loader?: MapLoader): string;
/**
 * Run a single stage by name (ASYNC path). Handles ML funcalls.
 *
 * For non-ML stages, delegates to the sync path (zero overhead).
 */
export declare function executeStageAsync(map: CompiledMap, stageName: string, input: string, loader?: MapLoader): Promise<string>;
//# sourceMappingURL=interpreter.d.ts.map