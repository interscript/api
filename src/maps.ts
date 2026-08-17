/**
 * Map delivery: the full corpus ships with the deploy as static assets
 * (minified JSON IR; the corpus gzips to ~21MB total). Assets are
 * immutable per release and served from the edge cache — bundled in the
 * Workers-idiomatic way, with no third-party fetch at runtime.
 *
 * Env contract: `env.ASSETS.fetch("/maps/<code>.json")` (Workers
 * Assets binding). Tests inject an equivalent object backed by the
 * local filesystem.
 */
import {
  MapNotFoundError,
  normaliseMap,
  type CompiledMap,
  type CompiledMapJson,
  type SystemCode,
} from "interscript-ts"
import { systemCodes } from "../maps/manifest.js"

// These four are dependency libraries, not user-addressable systems —
// the Ruby API lists maps only (var-* FAMILY maps are real systems).
const LIBRARIES = new Set(["unicode", "posix", "var-Cyrl", "var-kor"])
// ML-backed systems: the Ruby API's detection skips them per-map when no
// model runtime is configured (the deployed Lambda has none); detection
// here matches that behavior. transliterate() on them reports the same
// ML-unavailable error the Ruby engine does.
const ML_BACKED = new Set(["var-ara-Arab-Arab-rababa"])
const addressable = systemCodes.filter((code) => !LIBRARIES.has(code))
const detectable = addressable.filter((code) => !ML_BACKED.has(code))

export interface MapAssets {
  fetch(input: RequestInfo): Promise<Response>
}

const cache = new Map<SystemCode, CompiledMap>()

export function bundledSystemCodes(): readonly SystemCode[] {
  return addressable
}

export function detectableSystemCodes(): readonly SystemCode[] {
  return detectable
}

export async function loadMap(assets: MapAssets, code: SystemCode): Promise<CompiledMap> {
  const cached = cache.get(code)
  if (cached) return cached
  // The Workers ASSETS binding requires an absolute URL (host ignored).
  // The assets directory IS the maps directory — files serve at the
  // root, so no /maps/ prefix.
  const response = await assets.fetch(
    new Request(`https://assets.internal/${code}.json`),
  )
  if (!response.ok) {
    throw new MapNotFoundError(code)
  }
  const json = (await response.json()) as CompiledMapJson
  const map = normaliseMap(json)
  cache.set(code, map)
  return map
}
