/** Request limits, mirroring the Ruby API (lib/limits.rb). */
export const LIMITS = {
  input_max_size: 1_000_000,
} as const

export const INFER_TIMEOUT_MS = 120_000
