/**
 * REST v1 behavior tests — same fetch-interface harness as the GraphQL
 * suite (maps served from the local maps/ directory).
 */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { app } from "../src/server.js"

const assets = {
  fetch: async (url: RequestInfo): Promise<Response> => {
    const path = typeof url === "string" ? url : url.url
    const name = path.substring(path.lastIndexOf("/") + 1)
    const code = name.replace(".json", "")
    try {
      const body = readFileSync(`maps/${code}.json`)
      return new Response(body, { status: 200 })
    } catch {
      return new Response(null, { status: 404 })
    }
  },
}
const env = { ASSETS: assets }
const JSON_HEADERS = { "content-type": "application/json" }

async function get(path: string, extra: Record<string, string> = {}): Promise<Response> {
  return await app.request(
    `https://example.org${path}`,
    { headers: { ...JSON_HEADERS, ...extra } },
    env,
  )
}

async function post(
  path: string,
  body: unknown,
  extra: Record<string, string> = {},
): Promise<Response> {
  return await app.request(
    `https://example.org${path}`,
    { method: "POST", headers: { ...JSON_HEADERS, ...extra }, body: JSON.stringify(body) },
    env,
  )
}

describe("REST index + docs", () => {
  it("GET / lists endpoints", async () => {
    const res = await get("/")
    expect(res.status).toBe(200)
    const body = (await res.json()) as { endpoints: string[] }
    expect(body.endpoints).toContain("POST /v1/infer")
  })

  it("GET / serves the docs page to browsers, JSON to API clients", async () => {
    const html = await get("/", { accept: "text/html,application/xhtml+xml" })
    expect(html.status).toBe(200)
    expect(html.headers.get("content-type")).toContain("text/html")
    const page = await html.text()
    expect(page).toContain("<!doctype html>")
    expect(page).toMatch(/POST<\/span><\/td><td><code>\/v1\/transliterate/)

    const json = await get("/")
    expect(json.headers.get("content-type")).toContain("application/json")
  })

  it("GET /docs always serves the docs page", async () => {
    const res = await get("/docs")
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("text/html")
    const page = await res.text()
    expect(page).toContain("openapi.json")
    expect(page).toContain("/graphql")
  })

  it("GET /openapi.json serves a 3.1 document covering all routes", async () => {
    const res = await get("/openapi.json")
    expect(res.status).toBe(200)
    const spec = (await res.json()) as { openapi: string; paths: Record<string, unknown> }
    expect(spec.openapi).toBe("3.1.0")
    for (const p of [
      "/v1/info",
      "/v1/maps",
      "/v1/maps/{code}",
      "/v1/transliterate",
      "/v1/detect",
      "/v1/models",
      "/v1/models/{id}",
      "/v1/infer",
    ]) {
      expect(spec.paths[p], p).toBeDefined()
    }
  })

  it("GET /v1/info reports map and model counts", async () => {
    const res = await get("/v1/info")
    const body = (await res.json()) as { maps: number; models: number }
    expect(body.maps).toBeGreaterThan(200)
    expect(body.models).toBeGreaterThanOrEqual(9)
  })
})

describe("REST maps", () => {
  it("GET /v1/maps lists systems", async () => {
    const res = await get("/v1/maps")
    const body = (await res.json()) as { count: number; maps: string[] }
    expect(body.count).toBe(body.maps.length)
    expect(body.maps).toContain("alalc-kat-Geor-Latn-1997")
  })

  it("GET /v1/maps/:code returns the compiled map; unknown codes 404", async () => {
    const ok = await get("/v1/maps/alalc-kat-Geor-Latn-1997")
    expect(ok.status).toBe(200)
    expect(await ok.json()).toBeTruthy()
    const missing = await get("/v1/maps/does-not-exist")
    expect(missing.status).toBe(404)
    expect(((await missing.json()) as { error: { code: string } }).error.code).toBe("map_not_found")
  })
})

describe("REST transliteration", () => {
  it("POST /v1/transliterate mirrors the GraphQL engine", async () => {
    const res = await post("/v1/transliterate", {
      system: "alalc-kat-Geor-Latn-1997",
      input: "ქართული",
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { output: string }
    expect(body.output).toBe("k\u02bbart\u02bbuli")
  })

  it("rejects unknown systems and over-long input", async () => {
    const missing = await post("/v1/transliterate", { system: "nope", input: "x" })
    expect(missing.status).toBe(404)
    const tooLong = await post("/v1/transliterate", {
      system: "alalc-kat-Geor-Latn-1997",
      input: "a".repeat(1_000_001),
    })
    expect(tooLong.status).toBe(413)
  })
})

describe("REST detect", () => {
  it("ranks systems", async () => {
    const res = await post("/v1/detect", { input: "ქართული", output: "k\u02bbart\u02bbuli" })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { count: number; results: { mapName: string }[] }
    expect(body.count).toBeGreaterThan(0)
    expect(body.results[0]?.mapName).toContain("kat")
  }, 120_000)
})

describe("REST models + inference", () => {
  it("GET /v1/models lists the IMF index", async () => {
    const res = await get("/v1/models")
    const body = (await res.json()) as { count: number; models: { id: string; task: string }[] }
    expect(body.count).toBeGreaterThanOrEqual(9)
    expect(body.models.map((m) => m.id)).toContain("heb-diac-1.0")
  })

  it("GET /v1/models/:id returns the entry; unknown 404", async () => {
    const ok = await get("/v1/models/heb-diac-1.0")
    expect(ok.status).toBe(200)
    const missing = await get("/v1/models/nope-9.9")
    expect(missing.status).toBe(404)
  })

  it("POST /v1/infer validates without an upstream configured", async () => {
    const unconfigured = await post("/v1/infer", { model: "heb-diac-1.0", input: "x" })
    expect(unconfigured.status).toBe(503)

    const unknownModel = await post("/v1/infer", { model: "nope-9.9", input: "x" })
    expect(unknownModel.status).toBe(404)

    const badBody = await post("/v1/infer", { model: 1, input: "x" })
    expect(badBody.status).toBe(400)
  })
})
