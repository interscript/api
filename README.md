# interscript/api

**Interscript API software** — the GraphQL transliteration API as
deployable software for Cloudflare Workers (or any Workers-compatible
runtime).

This repository is the **software only**. Deployment configurations
(routes, domains, secrets, CI) live in separate deployment repositories —
interscript's own is [`interscript/api.interscript.org`](https://github.com/interscript/api.interscript.org).
Any organization can deploy this package privately on their own domain.

## What it serves

Field-for-field identical to the long-running Ruby API:

| field                                | behavior                        |
| ------------------------------------ | ------------------------------- |
| `info`                               | version JSON                    |
| `systemCodes`                        | all 287 transliteration systems |
| `transliterate(systemCode!, input!)` | transliterate (1MB input cap)   |
| `detect(input!, output!)`            | ranked `[{mapName, distance}]`  |

Error strings match byte-for-byte (`Couldn't locate <code>`).

## Architecture

- **Engine**: the native async interpreter from
  [`interscript-ts`](https://github.com/interscript/interscript-ts) —
  no regex compilation.
- **Maps**: the full corpus (287 systems + 4 dependency libraries,
  compiled to schema-versioned JSON IR from interscript-maps) is a
  deploy-time asset, not part of this npm package. Deployment repos fetch
  a pinned map artifact from `interscript/maps`, verify it, and expose it
  through the Workers Assets binding. Immutable per release, edge-cached,
  zero runtime third-party fetches.
- **Server**: Hono + GraphQL Yoga.

## Deploy your own

```bash
npm install @interscript/api-worker
# Then fetch/extract a pinned interscript/maps JSON-IR artifact into ./maps.
# Do not copy maps from this npm package; the package is code-only.
```

Minimal `wrangler.jsonc`:

```jsonc
{
  "name": "my-interscript-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-01",
  "assets": {
    "directory": "./maps",
    "binding": "ASSETS",
  },
  "routes": [{ "pattern": "api.example.org/*" }],
}
```

with `src/index.ts` re-exporting the package, then `wrangler deploy`.
See the [deployment repo](https://github.com/interscript/api.interscript.org)
for a complete, working example.

## Development

```bash
npm install
npm run build          # tsc
npm test               # vitest
npm run typecheck
npm run lint
```

Regenerating the map corpus (requires interscript-ruby + interscript-maps):

```bash
ruby scripts/build-maps.rb /path/to/interscript-ruby /path/to/maps ./maps
```

For production deploys, prefer a pinned release artifact from
`interscript/maps` over local regeneration; verify the artifact checksum
before `wrangler deploy`.

## Parity

`test/fixtures/parity.json` holds queries recorded from the production
Ruby API; CI replays them against this implementation. Zero-diff is the
release gate.

## REST v1 (OpenAPI)

REST endpoints serve alongside GraphQL (which remains at `POST /graphql`):

- `GET /openapi.json` — the OpenAPI 3.1 document
- `GET /v1/info` — version + capability summary
- `GET /v1/maps` / `GET /v1/maps/{code}` — bundled transliteration systems
- `POST /v1/transliterate` — `{system, input}` → `{output}`
- `POST /v1/detect` — `{input, output}` → ranked systems
- `GET /v1/models` / `GET /v1/models/{id}` — the neural model index (IMF v1, generated from interscript-ml's models.yaml via `npm run gen:models`)
- `POST /v1/infer` — `{model, input}` → `{output}`; proxies to the
  inference service configured with `ML_ENDPOINT` + `ML_TOKEN` env vars
  (Interscript runs `src/api/inference.py` on Modal: the same
  parity-verified ONNX decode that gates every release)
