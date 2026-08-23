/**
 * Detector — finds which transliteration system best explains how
 * `input` became `output`.
 *
 * Mirrors `interscript-ruby/lib/interscript/detector.rb` semantics:
 * iterate every known map, transliterate `input` through it, compute
 * Levenshtein distance to `output`, return ranked candidates.
 */
import type { DetectionResult, DetectOptions, SystemCode } from "./types.js";
import type { MapLoader } from "./loader.js";
/**
 * Compute Levenshtein edit distance between two strings.
 * Classic dynamic programming, O(m·n) time and O(min(m,n)) space.
 */
export declare function levenshtein(a: string, b: string): number;
/**
 * Run detect against every map the loader knows. Caller may pass an
 * explicit `knownMaps` iterable to restrict the scan (e.g. a curated
 * shortlist for performance).
 */
export declare function detectInMaps(input: string, output: string, loader: MapLoader, opts?: DetectOptions, knownMaps?: Iterable<SystemCode>): DetectionResult[];
//# sourceMappingURL=detector.d.ts.map