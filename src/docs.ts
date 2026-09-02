/**
 * The API's own webpage — served from the deployed worker at `/` (to
 * browsers, via content negotiation) and at `/docs` (always). Deployed
 * content belongs to the api.interscript.org deployment, not the main
 * website. Self-contained HTML: no external assets, system font stack.
 */

const ENDPOINTS: { method: string; path: string; note: string }[] = [
  { method: "GET", path: "/v1/info", note: "version + capability summary" },
  { method: "GET", path: "/v1/maps", note: "every transliteration system code" },
  { method: "GET", path: "/v1/maps/{code}", note: "one system's compiled map (JSON IR)" },
  { method: "POST", path: "/v1/transliterate", note: "{system, input} → {output}" },
  { method: "POST", path: "/v1/detect", note: "{input, output} → ranked systems" },
  { method: "GET", path: "/v1/models", note: "neural model index (IMF v1)" },
  { method: "GET", path: "/v1/models/{id}", note: "one model's metadata" },
  { method: "POST", path: "/v1/infer", note: "{model, input} → {output}" },
  { method: "POST", path: "/v1/infer/batch", note: "{model, inputs[]} → per-item results (≤50)" },
  {
    method: "GET",
    path: "/v1/assets/{tag}/{file}",
    note: "CORS streaming proxy for release assets",
  },
  { method: "POST", path: "/graphql", note: "GraphQL endpoint (introspection enabled)" },
  { method: "GET", path: "/openapi.json", note: "OpenAPI 3.1 document" },
]

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function docsPage(openapiPath: string): string {
  const rows = ENDPOINTS.map(
    (e) =>
      `<tr><td><span class="m">${esc(e.method)}</span></td><td><code>${esc(e.path)}</code></td><td>${esc(e.note)}</td></tr>`,
  ).join("\n")
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Interscript API</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 2.5rem 1.25rem 4rem;
    font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: #f6f3ec; color: #1a1d1f;
  }
  @media (prefers-color-scheme: dark) { body { background: #14171a; color: #eceae4; } }
  main { max-width: 44rem; margin: 0 auto; }
  h1 { font-size: 1.9rem; line-height: 1.15; margin: 0 0 .35rem; }
  .tagline { margin: 0 0 2rem; color: #5c6470; }
  .brand { color: #008075; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0 2rem; font-size: .95rem; }
  th, td { text-align: left; padding: .55rem .7rem; border-bottom: 1px solid rgba(128,128,128,.25); vertical-align: top; }
  th { font-size: .78rem; text-transform: uppercase; letter-spacing: .06em; color: #5c6470; }
  code { font: .9em ui-monospace, "SF Mono", Menlo, Consolas, monospace; }
  .m { font-weight: 700; font-size: .78rem; letter-spacing: .05em; color: #008075; }
  .links a { margin-right: 1.4rem; }
  a { color: #008075; }
  section { margin-top: 2.5rem; }
  pre { background: rgba(128,128,128,.12); padding: 1rem; border-radius: 6px; overflow-x: auto; }
</style>
</head>
<body>
<main>
  <h1><span class="brand">Interscript</span> API</h1>
  <p class="tagline">Authority-backed transliteration for every script — REST v1 + GraphQL on the edge.</p>

  <table>
    <thead><tr><th>Method</th><th>Endpoint</th><th>Behavior</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>

  <section>
    <h2>Quick start</h2>
    <pre><code>curl -X POST https://api.interscript.org/v1/transliterate \\
  -H 'Content-Type: application/json' \\
  -d '{"system":"alalc-ara-Arab-Latn-1997","input":"السلام عليكم"}'</code></pre>
  </section>

  <section>
    <h2>Machine-readable</h2>
    <p class="links">
      <a href="${esc(openapiPath)}">OpenAPI 3.1</a>
      <a href="/v1/models">Model index</a>
      <a href="/v1/maps">System codes</a>
      <a href="https://www.interscript.org">Interscript project</a>
      <a href="https://github.com/interscript/api">Source (BSD-2-Clause)</a>
    </p>
  </section>
</main>
</body>
</html>
`
}
