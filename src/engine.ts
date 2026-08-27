/**
 * Engine wiring: the native async interpreter from interscript-ts over
 * the assets-backed map loader. No regex compilation, ever.
 */
import { configure, transliterateAsync, type SystemCode } from "interscript"
import { bundledSystemCodes, detectableSystemCodes, loadMap, type MapAssets } from "./maps.js"
import type { LoadStrategy } from "interscript"

let configuredFor: MapAssets | undefined

function ensureEngine(assets: MapAssets): void {
  if (configuredFor === assets) return
  const strategy: LoadStrategy = (code: SystemCode) => loadMap(assets, code)
  configure({ strategies: [strategy] })
  configuredFor = assets
}

export async function transliterate(
  assets: MapAssets,
  systemCode: string,
  input: string,
): Promise<string> {
  ensureEngine(assets)
  return transliterateAsync(systemCode, input)
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j]! + 1,
        curr[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    prev = curr
  }
  return prev[b.length]!
}

// Mirrors interscript-ruby's detector: transliterate the input through
// every system, rank by Levenshtein distance to the output. Systems
// that fail (including ML-powered maps with no runtime configured) are
// skipped, exactly as the Ruby detector rescues per-map errors.
export async function detect(
  assets: MapAssets,
  input: string,
  output: string,
): Promise<{ mapName: string; distance: number }[]> {
  ensureEngine(assets)
  const candidates: { mapName: string; distance: number }[] = []
  for (const code of detectableSystemCodes()) {
    try {
      const transliterated = await transliterateAsync(code, input)
      candidates.push({ mapName: code, distance: levenshtein(transliterated, output) })
    } catch {
      continue
    }
  }
  return candidates.sort((a, b) => a.distance - b.distance)
}

export { bundledSystemCodes }
export type { SystemCode }
