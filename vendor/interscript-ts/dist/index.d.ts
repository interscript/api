/**
 * Public API surface of Interscript-TS.
 *
 * Mirrors `interscript-ruby/lib/interscript.rb`:
 *   - transliterate(systemCode, input)
 *   - loadMap(systemCode)
 *   - detect(input, output)
 *
 * The runtime is configured with a MapLoader. Callers can supply their
 * own (e.g. for browser fetch, for fs reads) without modifying the
 * interpreter (OCP).
 */
import type { CompiledMap, DetectionResult, DetectOptions, SystemCode } from "./types.js";
import { type LoadStrategy } from "./loader.js";
export { InterscriptError, MapNotFoundError, SystemConversionError, DependencyMissingError, MapLogicError, } from "./errors.js";
export type { CompiledMap, CompiledMapJson, DetectionResult, DetectOptions, FunctionDef, MapInfo, SystemCode, Stage, Rule, Item, SubRule, RunRule, FuncallRule, ParallelRule, SequentialRule, StringItem, CaptureGroupItem, CaptureRefItem, AliasItem, AnyItem, GroupItem, RepeatItem, StageItem, } from "./types.js";
export type { LoadStrategy, MapLoader } from "./loader.js";
export { normaliseMap, bundledStrategy } from "./loaders.js";
export { httpStrategy, type HttpStrategyOptions } from "./http-loader.js";
export { iscStrategy, iscBundledStrategy, type IscStrategyOptions } from "./isc/loader.js";
export type { IscDocument, IscItem, IscRule, IscStage, IscStageItem, IscTest, IscConstraint } from "./isc/types.js";
export { parseIsc } from "./isc/parser.js";
export { IscParseError } from "./isc/types.js";
export { iscToCompiledMap } from "./isc/converter.js";
export { setRababaConfig, resetRababaConfigs, type RababaConfigEntry, } from "./stdlib/ml.js";
export interface InterscriptConfig {
    /** Strategies consulted in order when loading a map. */
    readonly strategies?: LoadStrategy[];
    /** Default stage to execute if not specified. Default: "main". */
    readonly defaultStage?: string;
}
/** Configure the default runtime with custom strategies. */
export declare function configure(config: InterscriptConfig): void;
/** Public API — mirrors Interscript.transliterate from Ruby. */
export declare function transliterate(systemCode: SystemCode, input: string, stage?: string): string;
/**
 * Async transliterate. Use when async strategies (httpStrategy) are
 * configured and the map may not be in the cache yet.
 */
export declare function transliterateAsync(systemCode: SystemCode, input: string, stage?: string): Promise<string>;
/** Public API — mirrors Interscript.load. */
export declare function loadMap(systemCode: SystemCode): CompiledMap;
/** Async version — needed when async strategies may be used. */
export declare function loadMapAsync(systemCode: SystemCode): Promise<CompiledMap>;
/** Public API — mirrors Interscript.detect. */
export declare function detect(input: string, output: string, opts?: DetectOptions): DetectionResult[];
/** Reset the default runtime (mainly for tests). */
export declare function reset(): void;
//# sourceMappingURL=index.d.ts.map