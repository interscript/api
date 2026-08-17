/**
 * Records parity fixtures from the production Ruby API:
 *   node scripts/record-fixtures.mjs [https://api.interscript.org/graphql]
 * writes test/fixtures/parity.json — replayed by test/parity.test.ts
 * and required to match byte-for-byte in CI.
 */
import { writeFileSync, mkdirSync } from "node:fs"

const endpoint = process.argv[2] ?? "https://api.interscript.org/graphql"

const SAMPLES = [
  ["alalc-kat-Geor-Latn-1997", "ქართული"],
  ["bgnpcgn-kat-Geor-Latn-2009", "ქართული"],
  ["bgnpcgn-deu-Latn-Latn-2000", "Tschüß!"],
  ["odni-rus-Cyrl-Latn-2015", "привет мир"],
  ["icao-ukr-Cyrl-Latn-9303", "Київ"],
  ["alalc-amh-Ethi-Latn-2011", "ኢትዮጵያ"],
  ["un-tam-Taml-Latn-1972", "தமிழ்"],
  ["alalc-kat-Geor-Latn-1997", "ᲥᲐᲠᲗᲣᲚᲘ"],
  ["acadsin-zho-Hani-Latn-2002", "阜康"],
  ["sac-zho-Hans-Latn-1979", "中国"],
]

async function gql(query) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query }),
  })
  return response.json()
}

const fixtures = []
for (const [systemCode, input] of SAMPLES) {
  const result = await gql(
    `{ transliterate(systemCode: ${JSON.stringify(systemCode)}, input: ${JSON.stringify(input)}) }`,
  )
  fixtures.push({ kind: "transliterate", systemCode, input, result })
  console.log(
    `${systemCode}: ${JSON.stringify(result.data?.transliterate ?? result.errors?.[0]?.message)}`,
  )
}

const detect = await gql(
  `{ detect(input: ${JSON.stringify(SAMPLES[0][1])}, output: "kʻartʻuli") { mapName distance } }`,
)
fixtures.push({ kind: "detect", input: SAMPLES[0][1], output: "kʻartʻuli", result: detect })

const info = await gql("{ info }")
fixtures.push({ kind: "info", result: info })

mkdirSync("test/fixtures", { recursive: true })
writeFileSync("test/fixtures/parity.json", JSON.stringify(fixtures, null, 2) + "\n")
console.log(`recorded ${fixtures.length} fixtures from ${endpoint}`)
