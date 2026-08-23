/**
 * Map loading strategies — pluggable sources for compiled maps.
 *
 * Browser-safe: this module is safe to bundle into browsers. It only
 * exports `normaliseMap` (pure data) and `bundledStrategy` (works on
 * in-memory dictionaries). Filesystem strategies live in
 * `./loaders.node.ts` and pull in `node:fs` — that module is server-only.
 */
/**
 * Convert raw JSON IR (as emitted by the Ruby compiler) into the runtime
 * CompiledMap shape. Reconstructs Map objects for aliases and functions.
 *
 * Single responsibility: shape normalisation. No I/O.
 */
export function normaliseMap(json) {
    const out = {
        schemaVersion: json.schemaVersion,
        systemCode: json.systemCode,
        dependencies: json.dependencies,
        stages: json.stages,
        aliases: new Map(Object.entries(json.aliases)),
        functions: new Map(),
    };
    if (json.metadata)
        out.metadata = json.metadata;
    return out;
}
/**
 * Load maps from a JSON dictionary bundled at build time. Useful for
 * browser bundles, tests, and any context where the maps are already
 * in memory.
 */
export function bundledStrategy(maps) {
    const normalised = new Map();
    for (const [code, json] of Object.entries(maps)) {
        normalised.set(code, normaliseMap(json));
    }
    return (systemCode) => normalised.get(systemCode);
}
//# sourceMappingURL=loaders.js.map