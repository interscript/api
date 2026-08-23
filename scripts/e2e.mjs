#!/usr/bin/env node
/**
 * End-to-end API tests against a live deployment.
 *
 *   node scripts/e2e.mjs                          # https://api.interscript.org
 *   E2E_BASE_URL=https://interscript-api-staging.interscript.workers.dev node scripts/e2e.mjs
 *
 * Zero dependencies; exits non-zero on any failure. The first /v1/infer
 * call may take ~60s (inference-service cold start).
 */
const BASE = process.env.E2E_BASE_URL ?? "https://api.interscript.org"

let passed = 0
const failures = []

function check(name, cond, detail = "") {
  if (cond) {
    passed++
    console.log(`  ok ${name}`)
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`)
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { status: res.status, body, headers: res.headers }
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = text
  }
  return { status: res.status, body: parsed }
}

console.log(`E2E against ${BASE}\n`)

// --- service surface ---
{
  const res = await get("/")
  check("GET / 200", res.status === 200)
  check("GET / lists endpoints", Array.isArray(res.body.endpoints) && res.body.endpoints.includes("POST /v1/infer"))
}
{
  const res = await get("/openapi.json")
  check("GET /openapi.json 200", res.status === 200)
  check("openapi 3.1", res.body.openapi === "3.1.0")
  const paths = Object.keys(res.body.paths ?? {})
  for (const p of ["/v1/info", "/v1/maps", "/v1/maps/{code}", "/v1/transliterate", "/v1/detect", "/v1/models", "/v1/models/{id}", "/v1/infer"]) {
    check(`openapi has ${p}`, paths.includes(p))
  }
}
{
  const res = await get("/v1/info")
  check("GET /v1/info 200", res.status === 200)
  check("287 map systems", res.body.maps === 287, `got ${res.body.maps}`)
  check("model index served", res.body.models >= 9, `got ${res.body.models}`)
}

// --- maps ---
{
  const res = await get("/v1/maps")
  check("GET /v1/maps 200", res.status === 200)
  check("maps count consistent", res.body.count === res.body.maps.length)
  check("known system present", res.body.maps.includes("alalc-kat-Geor-Latn-1997"))
}
{
  const ok = await get("/v1/maps/alalc-kat-Geor-Latn-1997")
  check("GET /v1/maps/{code} 200", ok.status === 200 && typeof ok.body === "object")
  const missing = await get("/v1/maps/does-not-exist")
  check("unknown map 404", missing.status === 404)
  check("map 404 error shape", missing.body?.error?.code === "map_not_found")
}

// --- transliteration (byte-parity with the Ruby API fixture) ---
{
  const res = await post("/v1/transliterate", { system: "alalc-kat-Geor-Latn-1997", input: "ქართული" })
  check("transliterate 200", res.status === 200)
  check("transliterate Ruby parity", res.body.output === "kʻartʻuli", `got ${JSON.stringify(res.body.output)}`)
  const missing = await post("/v1/transliterate", { system: "nope-xxx-Xxx-Xxx-0000", input: "x" })
  check("transliterate unknown 404", missing.status === 404)
  const tooLong = await post("/v1/transliterate", { system: "alalc-kat-Geor-Latn-1997", input: "a".repeat(1_000_001) })
  check("transliterate 1MB limit 413", tooLong.status === 413)
  const bad = await post("/v1/transliterate", { system: 42 })
  check("transliterate bad body 400", bad.status === 400)
}

// --- detect ---
{
  const res = await post("/v1/detect", { input: "ქართული", output: "kʻartʻuli" })
  check("detect 200", res.status === 200)
  check("detect ranks a Georgian system first", (res.body.results ?? [])[0]?.mapName?.includes("kat"), JSON.stringify((res.body.results ?? []).slice(0, 2)))
}

// --- models ---
{
  const res = await get("/v1/models")
  check("GET /v1/models 200", res.status === 200)
  check("models count consistent", res.body.count === res.body.models.length)
  const ids = res.body.models.map((m) => m.id)
  check("hebrew model listed", ids.includes("heb-diac-1.0"))
  check("urdu g2p listed", ids.includes("urd-g2p-1.0"))
}
{
  const ok = await get("/v1/models/heb-diac-1.0")
  check("GET /v1/models/{id} 200", ok.status === 200 && ok.body.task === "diacritization")
  check("model entry has metrics", Array.isArray(ok.body.metrics) && ok.body.metrics.length > 0)
  const missing = await get("/v1/models/nope-9.9")
  check("unknown model 404", missing.status === 404)
}

// --- neural inference (live models) ---
{
  const res = await post("/v1/infer", { model: "heb-diac-small-1.0", input: "שלום עליכם" })
  check("infer hebrew 200", res.status === 200, JSON.stringify(res.body).slice(0, 120))
  check("infer hebrew adds nikud", typeof res.body.output === "string" && res.body.output.includes("ָ"), `got ${JSON.stringify(res.body.output)}`)
}
{
  const res = await post("/v1/infer", { model: "urd-g2p-1.0", input: "اردو" })
  check("infer urdu 200", res.status === 200)
  check("infer urdu IPA output", typeof res.body.output === "string" && res.body.output.length > 0 && /[ɑɐəɪʊuː]/.test(res.body.output), `got ${JSON.stringify(res.body.output)}`)
}
{
  const missing = await post("/v1/infer", { model: "nope-9.9", input: "x" })
  check("infer unknown model 404", missing.status === 404)
  const bad = await post("/v1/infer", { model: "heb-diac-1.0" })
  check("infer missing input 400", bad.status === 400)
}

// --- GraphQL back-compat ---
{
  const q = async (query) => {
    const res = await fetch(`${BASE}/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query }),
    })
    return res.json()
  }
  const info = await q("{ info }")
  check("graphql info", JSON.parse(info.data.info).version.startsWith("3."))
  const codes = await q("{ systemCodes }")
  check("graphql systemCodes 287", codes.data.systemCodes.length === 287, `got ${codes.data.systemCodes.length}`)
  const tr = await q('{ transliterate(systemCode: "alalc-kat-Geor-Latn-1997", input: "ქართული") }')
  check("graphql transliterate parity", tr.data.transliterate === "kʻartʻuli")
}

// --- CORS ---
{
  const res = await fetch(`${BASE}/v1/info`, { method: "OPTIONS" })
  check("CORS preflight ok", res.status === 204 || res.ok, `status ${res.status}`)
  check("CORS allow-origin", (res.headers.get("access-control-allow-origin") ?? "") === "*")
}

console.log(`\n${passed} passed, ${failures.length} failed`)
if (failures.length) {
  for (const f of failures) console.log(`FAIL ${f}`)
  process.exit(1)
}
