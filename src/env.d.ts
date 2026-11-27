/**
 * Bindings that `wrangler types` cannot see, declared into the
 * generated Env (worker-configuration.d.ts) via declaration merging —
 * the documented pattern for secrets and deployment-supplied vars.
 *
 * Both are optional: a deployment without them serves the
 * transliteration surface only, and the ml surface answers with a
 * named "ML inference unavailable" error.
 *
 *   ML_ENDPOINT — the inference service endpoint (POST {model, input}
 *     -> {output}, x-api-key auth). Set as a var or secret in the
 *     deployment's own config (this repo's canonical wrangler.jsonc
 *     deliberately carries no placeholder: a `vars` entry would pin
 *     the type to that literal for every deployment).
 *   ML_TOKEN — the x-api-key credential; set with
 *     `npx wrangler secret put ML_TOKEN`.
 */
interface Env {
  ML_ENDPOINT?: string
  ML_TOKEN?: string
}
