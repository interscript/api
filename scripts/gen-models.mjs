// Regenerate src/generated/models.json from a checkout of
// interscript/interscript-ml (default path ../ml-models is the
// historical local name; override with INTERSCRIPT_ML_DIR).
import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { parse } from "yaml"

const dir = process.env.INTERSCRIPT_ML_DIR ?? "../ml-models"
const data = parse(readFileSync(`${dir}/models.yaml`, "utf8"))
const fields = [
  "id",
  "task",
  "scripts",
  "precision",
  "filename",
  "url",
  "parts",
  "sha256",
  "size",
  "metrics",
  "parity",
  "license",
]
const projection = {
  version: data.version ?? 1,
  models: Object.entries(data.models).map(([id, m]) =>
    Object.fromEntries([
      ["id", id],
      ...fields.filter((k) => k !== "id").map((k) => [k, m[k] ?? null]),
    ]),
  ),
}
mkdirSync("src/generated", { recursive: true })
writeFileSync("src/generated/models.json", JSON.stringify(projection, null, 1) + "\n")
console.log(`wrote ${projection.models.length} models`)
