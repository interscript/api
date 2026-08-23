/**
 * REST v1 — the OpenAPI-first interface to Interscript.
 *
 *   GET  /openapi.json        the OpenAPI 3.1 document
 *   GET  /                    service index (JSON)
 *   GET  /v1/info             version + capability summary
 *   GET  /v1/maps             every bundled transliteration system code
 *   GET  /v1/maps/:code       one system's compiled map (JSON IR)
 *   POST /v1/transliterate    {system, input} -> {output}
 *   POST /v1/detect           {input, output} -> ranked systems
 *   GET  /v1/models           the neural model index (IMF v1)
 *   GET  /v1/models/:id       one model's full entry
 *   POST /v1/infer            {model, input} -> {output} (Modal proxy)
 *
 * GraphQL remains at POST /graphql (and any other path, for
 * compatibility with the Ruby API's {proxy+} behavior).
 */
import { Hono } from "hono";
import { type Env } from "./resolvers.js";
export declare const rest: Hono<{
    Bindings: Env;
}, import("hono/types").BlankSchema, "/">;
