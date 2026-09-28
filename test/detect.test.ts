import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { detect } from "../src/engine.js"
import { detectInputScript } from "../src/scripts.js"
import type { MapAssets } from "../src/maps.js"

const fetched: string[] = []
const env: MapAssets = {
  fetch: async (url) => {
    const path = typeof url === "string" ? url : url.url
    const code = path.substring(path.lastIndexOf("/") + 1).replace(".json", "")
    fetched.push(code)
    try {
      return new Response(readFileSync(`maps/${code}.json`), { status: 200 })
    } catch {
      return new Response(null, { status: 404 })
    }
  },
}

describe("detectInputScript", () => {
  it("detects the majority script of the input", () => {
    expect(detectInputScript("ქართული")).toBe("Geor")
    expect(detectInputScript("한국")).toBe("Hang")
    expect(detectInputScript("Привет")).toBe("Cyrl")
    expect(detectInputScript(" தமிழ் ")).toBe("Taml")
  })

  it("prefers the non-Latin script in mixed input", () => {
    expect(detectInputScript("한국a")).toBe("Hang")
    expect(detectInputScript("київ word")).toBe("Cyrl")
  })

  it("falls back to Latin for pure ASCII", () => {
    expect(detectInputScript("hello world")).toBe("Latn")
  })

  it("returns null when no script characters are present", () => {
    expect(detectInputScript("123 !?")).toBeNull()
    expect(detectInputScript("")).toBeNull()
  })
})

describe("detect prefilter", () => {
  it("only loads maps whose source script matches the input", async () => {
    fetched.length = 0
    const results = await detect(env, "ქართული", "kʻartʻuli")
    // 8 Georgian-source systems, not the full 288-map walk.
    expect(fetched.length).toBeLessThanOrEqual(10)
    expect(results[0]).toMatchObject({ mapName: "alalc-kat-Geor-Latn-1997", distance: 0 })
  })

  it("matches Korean-family sources for Hangul input", async () => {
    fetched.length = 0
    const results = await detect(env, "한국", "Hanguk")
    expect(results[0]!.distance).toBe(0)
    expect(results.map((r) => r.mapName)).toContain("var-kor-Kore-Latn-mr-1939")
  })

  it("ranks Han-source systems for Han input", async () => {
    const results = await detect(env, "阜康", "Fukang")
    expect(results[0]).toMatchObject({ mapName: "acadsin-zho-Hani-Latn-2002" })
  })

  it("returns an empty ranking for script-less input", async () => {
    fetched.length = 0
    const results = await detect(env, "123 !?", "x")
    expect(results).toEqual([])
    expect(fetched).toEqual([])
  })
})
