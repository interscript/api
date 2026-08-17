/**
 * @interscript/api-worker — deployable Interscript API software.
 *
 * Deploy your own endpoint:
 *   1. npm install @interscript/api-worker
 *   2. wrangler.jsonc: { "main": "src/index.ts" } importing this package
 *      (or use the ready-made api.interscript.org deployment repo).
 *   3. wrangler deploy — routes, domain, and credentials are yours.
 *
 * This package contains no organizational specifics: no routes, no
 * secrets, no telemetry.
 */
export { app, default } from "./server.js";
export { typeDefs } from "./schema.js";
export { API_VERSION } from "./resolvers.js";
export { LIMITS } from "./limits.js";
