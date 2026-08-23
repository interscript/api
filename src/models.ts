/**
 * The neural model index: a generated projection of interscript-ml's
 * models.yaml (the IMF v1 contract). Regenerate with
 * `npm run gen:models` from a checkout of interscript/interscript-ml.
 */
import index from "./generated/models.json"

export interface ModelMetric {
  name: string
  value: number
  source: string
}

export interface ModelEntry {
  id: string
  task: "g2p" | "diacritization" | "translit"
  scripts: string[]
  precision: string
  filename: string | null
  url: string | null
  parts: unknown
  sha256: string | null
  size: number | null
  metrics: ModelMetric[]
  parity: { samples: number; cer_delta: number } | null
  license: string
}

interface ModelIndex {
  version: number
  models: ModelEntry[]
}

const data = index as unknown as ModelIndex

export function listModels(): ModelEntry[] {
  return data.models
}

export function getModel(id: string): ModelEntry | undefined {
  return data.models.find((m) => m.id === id)
}

export const MODELS_INDEX_VERSION = data.version
