/**
 * Resolvers — behavior-matched to the Ruby API. The map assets binding
 * arrives via the Yoga context (yoga.fetch(request, env, ctx)).
 */
import { MapNotFoundError as EngineMapNotFoundError } from "interscript-ts"
import { detect, transliterate } from "./engine.js"
import { InputTooLongError, MapNotFoundError } from "./errors.js"
import { LIMITS } from "./limits.js"
import { bundledSystemCodes } from "./engine.js"

export const API_VERSION = "3.0.0-cloudflare.1"

export interface AssetsBinding {
  fetch(url: string): Promise<Response>
}

export interface Env {
  ASSETS?: AssetsBinding
}

// The ASSETS binding is constant for an isolate's lifetime; the Hono
// handler sets it once from c.env (threaded correctly by Hono in both
// Workers and tests).
let assets: AssetsBinding | undefined

export function setAssets(binding: AssetsBinding): void {
  assets = binding
}

export function requireAssets(): AssetsBinding {
  if (!assets) {
    throw new Error("ASSETS binding missing — see README deployment notes")
  }
  return assets
}

export async function info(): Promise<string> {
  return JSON.stringify({
    version: API_VERSION,
    engine: "interscript-ts@native-interpreter",
  })
}

export function systemCodesResolver(): string[] {
  return [...bundledSystemCodes()]
}

export async function transliterateResolver(systemCode: string, input: string): Promise<string> {
  if (input.length > LIMITS.input_max_size) {
    throw new InputTooLongError(LIMITS.input_max_size)
  }
  try {
    return await transliterate(requireAssets(), systemCode, input)
  } catch (e) {
    // Engine convention is "Map not found: X"; the public API has
    // always said "Couldn't locate X" — keep client compatibility.
    if (e instanceof EngineMapNotFoundError) {
      throw new MapNotFoundError(systemCode)
    }
    throw e
  }
}

export async function detectResolver(
  input: string,
  output: string,
): Promise<{ mapName: string; distance: number }[]> {
  return detect(requireAssets(), input, output)
}
