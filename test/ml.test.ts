/**
 * WO15: the neural edge surface — in-worker plane execution.
 * Runs the REAL plane runtime (vitest alias -> interscript-ts source)
 * against a REAL local HTTP server serving the tiny-plane fixture.
 */

import { createServer, type Server } from "node:http"
import { readFileSync } from "node:fs"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import {
  executePlane,
  isEdgeIneligible,
  MlError,
  runModel,
  WORKER_MODEL_MAX_BYTES,
} from "../src/ml.js"
import { createHash } from "node:crypto"

const FIXTURE = new URL("./fixtures/tiny-plane.zip", import.meta.url)
const bytes = new Uint8Array(readFileSync(FIXTURE))
const sha = createHash("sha256").update(bytes).digest("hex")

let server: Server
let port = 0

beforeAll(async () => {
  server = createServer((req, res) => {
    res.writeHead(200, { "content-type": "application/zip" })
    res.end(Buffer.from(bytes))
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  port = (server.address() as { port: number }).port
})

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
})

const artifact = () => ({ url: `http://127.0.0.1:${port}/tiny-plane.zip`, sha256: sha })

describe("executePlane (real fetch -> verify -> session -> decode)", () => {
  it("decodes the fixture through the full chain", async () => {
    const out = await executePlane({ artifact: artifact(), text: "كتب" })
    expect(out).toBe("كُتُبُ") // MASK(4) -> 1 -> 2: damma on k=2
  })

  it("preserve mode round-trips user diacritics", async () => {
    const out = await executePlane({
      artifact: artifact(), text: "كُتُبُ", preserveDiacritics: true,
    })
    expect(out).toBe("كُتُبُ")
  })

  it("rejects a sha mismatch loudly", async () => {
    await expect(
      executePlane({ artifact: { ...artifact(), sha256: "0".repeat(64) }, text: "كتب" }),
    ).rejects.toThrow(/sha256 mismatch/)
  })

  it("refuses artifacts above the in-worker budget", async () => {
    await expect(
      executePlane({
        artifact: { ...artifact(), size: WORKER_MODEL_MAX_BYTES + 1 },
        text: "كتب",
      }),
    ).rejects.toThrow(/in-worker budget/)
  })
})

describe("runModel dispatch", () => {
  it("404s on unknown ids", async () => {
    await expect(runModel({ id: "nope", text: "x" })).rejects.toMatchObject({
      status: 404,
    })
  })

  it("marks server-side ineligibility for the proxy fallback", () => {
    const err = new MlError(503, "model_too_large_for_worker", "big")
    expect(isEdgeIneligible(err)).toBe(true)
    expect(isEdgeIneligible(new MlError(404, "unknown_model", "x"))).toBe(false)
    expect(isEdgeIneligible(new Error("x"))).toBe(false)
  })
})

describe("POST /v1/infer edge-first dispatch", () => {
  it("404s unknown models (route contract)", async () => {
    const { rest } = await import("../src/rest.js")
    const res = await rest.request("/v1/infer", {
      method: "POST",
      body: JSON.stringify({ model: "does-not-exist", input: "x" }),
    })
    expect(res.status).toBe(404)
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe(
      "model_not_found",
    )
  })

  it("falls back to the proxy (503 unconfigured) for oversized plane artifacts", async () => {
    const { rest } = await import("../src/rest.js")
    // heb-diac-plane-2.0 is 416MB — over the in-worker budget, no
    // ML_ENDPOINT configured in tests -> proxy path -> 503
    const res = await rest.request("/v1/infer", {
      method: "POST",
      body: JSON.stringify({ model: "heb-diac-plane-2.0", input: "שלום" }),
    })
    expect(res.status).toBe(503)
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe(
      "inference_unconfigured",
    )
  })
})
