/**
 * WO15: the neural edge surface — kind-aware execution on the worker.
 *
 * Plane artifacts small enough for worker memory (budget below) run
 * IN-WORKER: zip fetched from the Releases data channel (Cache API
 * between calls), sha-verified, decoded by the interscript-ts plane
 * runtime. Larger models answer 503 with a pointer to the
 * client/runtime path — workerd caps isolate memory at 128 MB, and we
 * say so rather than OOM.
 */

import { createPlaneModel } from "interscript/ml"
import { getModel } from "./models.js"

/** In-worker execution budget (bytes). 100 MB leaves headroom inside
 * the 128 MB workerd isolate limit for the session + decode. */
export const WORKER_MODEL_MAX_BYTES = 100 * 1024 * 1024

export class MlError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

export interface MlRequest {
  readonly id: string
  readonly text: string
  readonly preserveDiacritics?: boolean
}

/** A resolved artifact: from the index, or supplied directly (tests,
 * self-hosters with mirrors). */
export interface PlaneArtifact {
  readonly url: string
  readonly sha256: string
  readonly size?: number | undefined
}

interface ZipCache {
  match(key: RequestInfo): Promise<Response | undefined>
  put(key: RequestInfo, res: Response): Promise<void>
}

function cacheInterface(): ZipCache | undefined {
  if (typeof caches === "undefined") return undefined
  // workerd exposes caches.default; tests run without it (no cache)
  return (caches as unknown as { default?: ZipCache }).default
}

async function fetchZip(url: string, sha256: string): Promise<Uint8Array> {
  const cache = cacheInterface()
  const key = `https://ml.interscript.internal/zip/${sha256}`
  const hit = await cache?.match(key)
  if (hit) return new Uint8Array(await hit.arrayBuffer())
  const res = await fetch(url)
  if (!res.ok) {
    throw new MlError(502, "artifact_fetch_failed", `artifact fetch failed: ${res.status}`)
  }
  const bytes = new Uint8Array(await res.arrayBuffer())
  const digest = await crypto.subtle.digest("SHA-256", bytes.buffer as ArrayBuffer)
  const got = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  if (got !== sha256) {
    throw new MlError(502, "artifact_sha_mismatch", `artifact sha256 mismatch: ${got}`)
  }
  await cache?.put(key, new Response(bytes))
  return bytes
}

/** Errors that mean "not executable here, try the fallback path". */
export function isEdgeIneligible(err: unknown): boolean {
  return err instanceof MlError && err.status >= 500
}

export async function runModel(req: MlRequest): Promise<string> {
  const entry = getModel(req.id)
  if (!entry) {
    throw new MlError(404, "unknown_model", `unknown model id '${req.id}'`)
  }
  const kind = (entry as { kind?: string }).kind ?? "imf-v1"
  if (kind !== "plane") {
    throw new MlError(
      501, "kind_not_edge_executable",
      `kind '${kind}' does not run in-worker yet; use the interscript runtime (py/ruby/ts)`,
    )
  }
  if (!entry.url || !entry.sha256) {
    throw new MlError(503, "artifact_unresolvable", "model has no release artifact")
  }
  const artifact: PlaneArtifact = {
    url: entry.url, sha256: entry.sha256, size: entry.size ?? undefined,
  }
  const args: Parameters<typeof executePlane>[0] = {
    artifact, text: req.text,
  }
  if (req.preserveDiacritics !== undefined) {
    args.preserveDiacritics = req.preserveDiacritics
  }
  return executePlane(args)
}

export interface ExecutePlaneArgs {
  readonly artifact: PlaneArtifact
  readonly text: string
  preserveDiacritics?: boolean
}

export async function executePlane(args: ExecutePlaneArgs): Promise<string> {
  const { artifact, text } = args
  if ((artifact.size ?? 0) > WORKER_MODEL_MAX_BYTES) {
    throw new MlError(
      503, "model_too_large_for_worker",
      `artifact exceeds the in-worker budget (${WORKER_MODEL_MAX_BYTES} bytes); ` +
        `workerd isolates cap at 128 MB. Run via the interscript runtime ` +
        `(py/ruby/ts) or a self-hosted inference service.`,
    )
  }
  const zip = await fetchZip(artifact.url, artifact.sha256)
  const model = await createPlaneModel(zip)
  try {
    return await model.transform(text, {
      preserveDiacritics: args.preserveDiacritics ?? false,
    })
  } finally {
    await model.dispose()
  }
}
