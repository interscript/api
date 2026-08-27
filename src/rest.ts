/**
 * REST v1 — the OpenAPI-first interface to Interscript.
 *
 *   GET  /openapi.json        the OpenAPI 3.1 document
 *   GET  /                    service index (JSON)
 *   GET  /v1/info             version + capability summary
 *   GET  /v1/maps             every bundled transliteration system code
 *   GET  /v1/maps/:code       one system's compiled map (JSON IR)
 *   POST /v1/transliterate    {system, input} -> {output}
 *   POST /v1/detect           {input, output} -> ranked systems
 *   GET  /v1/models           the neural model index (IMF v1)
 *   GET  /v1/models/:id       one model's full entry
 *   POST /v1/infer            {model, input} -> {output} (Modal proxy)
 *
 * GraphQL remains at POST /graphql (and any other path, for
 * compatibility with the Ruby API's {proxy+} behavior).
 */
import { Hono } from "hono"
import {
  API_VERSION,
  detectResolver,
  setAssets,
  transliterateResolver,
  type Env,
} from "./resolvers.js"
import { InputTooLongError, MapNotFoundError } from "./errors.js"
import { INFER_TIMEOUT_MS, LIMITS } from "./limits.js"
import { bundledSystemCodes } from "./engine.js"
import { getModel, listModels, MODELS_INDEX_VERSION } from "./models.js"
import { OPENAPI } from "./openapi.js"
import { docsPage } from "./docs.js"

function errorResponse(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status })
}

export const rest = new Hono<{ Bindings: Env }>()

const wantsHtml = (accept: string | undefined): boolean =>
  (accept ?? "").toLowerCase().includes("text/html")

rest.get("/docs", (c) => c.html(docsPage("/openapi.json")))

rest.get("/", (c) =>
  wantsHtml(c.req.header("accept"))
    ? c.html(docsPage("/openapi.json"))
    : c.json({
        name: "Interscript API",
        version: "v1",
        openapi: "/openapi.json",
        endpoints: [
          "GET /v1/info",
          "GET /v1/maps",
          "GET /v1/maps/{code}",
          "POST /v1/transliterate",
          "POST /v1/detect",
          "GET /v1/models",
          "GET /v1/models/{id}",
          "POST /v1/infer",
          "POST /graphql",
        ],
      }),
)

rest.get("/openapi.json", (c) => c.json(OPENAPI))

rest.get("/v1/info", (c) =>
  c.json({
    api_version: "1.0.0",
    engine_version: API_VERSION,
    engine: "interscript-ts@native-interpreter",
    maps: bundledSystemCodes().length,
    models: listModels().length,
    models_index_version: MODELS_INDEX_VERSION,
    limits: LIMITS,
  }),
)

rest.get("/v1/maps", (c) =>
  c.json({ count: bundledSystemCodes().length, maps: bundledSystemCodes() }),
)

rest.get("/v1/maps/:code", async (c) => {
  const assets = c.env?.ASSETS
  if (!assets) return errorResponse(503, "assets_missing", "ASSETS binding not configured")
  const code = c.req.param("code")
  if (!bundledSystemCodes().includes(code as never)) {
    return errorResponse(404, "map_not_found", `Couldn't locate ${code}`)
  }
  // The assets directory IS the maps directory (no /maps/ prefix) and
  // requires absolute URLs.
  const response = await assets.fetch(`https://assets.internal/${code}.json`)
  if (!response.ok) {
    return errorResponse(404, "map_not_found", `Couldn't locate ${code}`)
  }
  return new Response(response.body, {
    headers: { "content-type": "application/json; charset=utf-8" },
  })
})

rest.post("/v1/transliterate", async (c) => {
  const assets = c.env?.ASSETS
  if (!assets) return errorResponse(503, "assets_missing", "ASSETS binding not configured")
  setAssets(assets)
  const body = await c.req.json<unknown>().catch(() => null)
  if (!body || typeof body !== "object") {
    return errorResponse(400, "bad_request", "body must be JSON {system, input}")
  }
  const { system, input } = body as { system?: unknown; input?: unknown }
  if (typeof system !== "string" || typeof input !== "string") {
    return errorResponse(400, "bad_request", "system and input must be strings")
  }
  try {
    const output = await transliterateResolver(system, input)
    return c.json({ system, input, output })
  } catch (e) {
    if (e instanceof InputTooLongError) {
      return errorResponse(413, "input_too_long", e.message)
    }
    if (e instanceof MapNotFoundError) {
      return errorResponse(404, "map_not_found", e.message)
    }
    return errorResponse(500, "engine_error", String(e))
  }
})

rest.post("/v1/detect", async (c) => {
  const assets = c.env?.ASSETS
  if (!assets) return errorResponse(503, "assets_missing", "ASSETS binding not configured")
  setAssets(assets)
  const body = await c.req.json<unknown>().catch(() => null)
  const { input, output } = (body ?? {}) as { input?: unknown; output?: unknown }
  if (typeof input !== "string" || typeof output !== "string") {
    return errorResponse(400, "bad_request", "input and output must be strings")
  }
  const results = await detectResolver(input, output)
  return c.json({ count: results.length, results })
})

rest.get("/v1/models", (c) => c.json({ count: listModels().length, models: listModels() }))

rest.get("/v1/models/:id", (c) => {
  const model = getModel(c.req.param("id"))
  if (!model) return errorResponse(404, "model_not_found", `Couldn't locate ${c.req.param("id")}`)
  return c.json(model)
})

rest.post("/v1/infer", async (c) => {
  const body = await c.req.json<unknown>().catch(() => null)
  const { model, input } = (body ?? {}) as { model?: unknown; input?: unknown }
  if (typeof model !== "string" || typeof input !== "string") {
    return errorResponse(400, "bad_request", "body must be JSON {model, input}")
  }
  if (!getModel(model)) {
    return errorResponse(404, "model_not_found", `Couldn't locate ${model}`)
  }
  const { ML_ENDPOINT, ML_TOKEN } = (c.env ?? {}) as Record<string, string | undefined>
  if (!ML_ENDPOINT || !ML_TOKEN) {
    return errorResponse(
      503,
      "inference_unconfigured",
      "ML_ENDPOINT/ML_TOKEN are not set on this deployment",
    )
  }
  const upstream = await fetch(`${ML_ENDPOINT}/infer`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": ML_TOKEN },
    body: JSON.stringify({ model, input }),
    signal: AbortSignal.timeout(INFER_TIMEOUT_MS),
  }).catch(() => null)
  if (!upstream || !upstream.ok) {
    const detail = upstream ? await upstream.text().catch(() => "") : "upstream unreachable"
    return errorResponse(502, "inference_upstream", detail.slice(0, 500))
  }
  const result = (await upstream.json()) as Record<string, unknown>
  return c.json({
    model,
    task: result["task"],
    input,
    output: result["output"],
  })
})
