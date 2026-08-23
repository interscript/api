// Regenerate src/generated/models.json from a checkout of
// interscript/interscript-ml (default path ../ml-models is the
// historical local name; override with INTSCRIPT_ML_DIR).
import { execSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"

const dir = process.env.INTERSCRIPT_ML_DIR ?? "../ml-models"
const yaml = `${dir}/models.yaml`
mkdirSync("src/generated", { recursive: true })
const out = execSync(
  `python3 -c '${[
    "import json,yaml",
    "d=yaml.safe_load(open(" + JSON.stringify(yaml) + "))",
    "print(json.dumps({'version':d.get('version',1),'models':[{k:m.get(k) for k in",
    "('id','task','scripts','precision','filename','url','parts','sha256','size','metrics','parity','license')}",
    "for m in d['models'].values()]}))",
  ].join(" ")}'`,
).toString()
const parsed = JSON.parse(out)
writeFileSync("src/generated/models.json", JSON.stringify(parsed, null, 1) + "\n")
console.log(`wrote ${parsed.models.length} models`)
