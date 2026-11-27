# ADR 0001: The regex boundary — map-data path vs request handling

**Status:** Accepted (owner-delegated adjudication, 2026-11-27)
**Context:** The engine-wiring header (`src/engine.ts`) carries the standing
directive "No regex compilation, ever." An audit of the vendored
transliteration engine observed that the engine's own internals compile
per-rule `RegExp` objects, and closer inspection shows the package's own
request handlers (`src/rest.ts`, `src/docs.ts`) have used small static
regex literals since the blessed August 2026 snapshot. This ADR settles
what the directive binds so the invariant can be enforced instead of
debated.

## Facts

1. The map-data path — `src/engine.ts`, `src/maps.ts`, `src/resolvers.ts`
   — compiles no regexes and never has. Map IR is data: it is loaded,
   bound, and delegated to the `interscript` engine whole; nothing in this
   package parses or rewrites map definitions, and the directive was
   written to keep it that way.
2. Two request handlers use small static regex literals shipped in the
   blessed August 2026 snapshot: asset-path validation
   (`/^\/v1\/assets\//`-shaped patterns in `src/rest.ts`) and HTML
   escaping in `src/docs.ts`. These operate on request/output shape with
   bounded, static patterns — not on map data.
3. The vendored `interscript` engine (npm `interscript@5.x`) compiles
   per-rule `RegExp` objects for the subset of ISC rule forms whose
   semantics are regex-expressible. This is identical to the blessed
   snapshot; it is the engine's dependency-pinned architecture, outside
   this package's code.
4. Workers' V8 supports `RegExp` natively; per-rule engine patterns are
   small and bounded by the map IR. Unbounded-input hazards are handled
   separately (streaming/windowing; detect under the paid CPU limit).

## Decision

The directive binds **the map-data path**: modules that touch map IR —
engine wiring, the assets loader, resolvers — compile no regexes, and
**every new `src/` module inherits that invariant by default**, enforced
by `no-restricted-syntax` in `eslint.config.js`.

The two named exceptions (`src/rest.ts`, `src/docs.ts`) are the blessed
request handlers; adding a file to that exception list is an ADR decision,
not a lint suppression. The vendored engine's internal per-rule regex
compilation is exempt: it is the engine's architecture, and changing it is
a dependency-pin decision, never an API-layer one.

## Consequences

- Regex use cannot creep into the map-data path or any new module
  silently; CI fails on it.
- The engine dependency can be bumped freely for engine-internal changes;
  this ADR requires no re-litigation per release.
- If the engine ever grows an alternative no-regex back end, adopting it
  is a dependency-pin change recorded in a new ADR.
