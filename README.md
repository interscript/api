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

| field | behavior |
|---|---|
| `info` | version JSON |
| `systemCodes` | all 287 transliteration systems |
| `transliterate(systemCode!, input!)` | transliterate (1MB input cap) |
| `detect(input!, output!)` | ranked `[{mapName, distance}]` |

Error strings match byte-for-byte (`Couldn't locate <code>`).

## Architecture

- **Engine**: the native async interpreter from
  [`interscript-ts`](https://github.com/interscript/interscript-ts) —
  no regex compilation.
- **Maps**: the full corpus (287 systems + 4 dependency libraries,
  compiled to schema-versioned JSON IR from interscript-maps 2.4.3) is
  **bundled with the deploy as static assets** — minified ~260MB,
  ~21MB gzipped, every file well under the 20MiB asset limit. Immutable
  per release, edge-cached, zero runtime third-party fetches.
- **Server**: Hono + GraphQL Yoga.

## Deploy your own

```bash
npm install @interscript/api-worker
```

Minimal `wrangler.jsonc`:

```jsonc
{
  "name": "my-interscript-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-01",
  "assets": {
    "directory": "./node_modules/@interscript/api-worker/maps",
    "binding": "ASSETS"
  },
  "routes": [{ "pattern": "api.example.org/*" }]
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
ruby -e '... see scripts/build-maps.rb ...'
```

## Parity

`test/fixtures/parity.json` holds queries recorded from the production
Ruby API; CI replays them against this implementation. Zero-diff is the
release gate.
