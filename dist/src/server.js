/**
 * The Worker: Hono router + GraphQL Yoga executor.
 *
 * Route parity with the AWS deployment: GraphQL answers on POST to any
 * path (API Gateway was `{proxy+}`); OPTIONS returns the CORS preflight.
 */
import { createYoga, createSchema } from "graphql-yoga";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { typeDefs } from "./schema.js";
import { rest } from "./rest.js";
import { detectResolver, info, setAssets, setMl, systemCodesResolver, transliterateResolver, } from "./resolvers.js";
const yoga = createYoga({
    schema: createSchema({
        typeDefs,
        resolvers: {
            Query: {
                info: () => info(),
                systemCodes: () => systemCodesResolver(),
                transliterate: (_parent, args) => transliterateResolver(args.systemCode, args.input),
                detect: (_parent, args) => detectResolver(args.input, args.output),
            },
        },
    }),
    graphqlEndpoint: "*",
    landingPage: false,
    // The Ruby API surfaces its real error messages ("Couldn't locate
    // <code>"); masking them would break client compatibility.
    maskedErrors: false,
});
export const app = new Hono();
app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"] }));
// REST v1 (OpenAPI: GET /openapi.json) — mounted before the GraphQL
// catch-all so /v1/* and / serve REST; everything else stays GraphQL.
app.route("/", rest);
app.all("*", async (c) => {
    const env = c.env;
    if (env?.ASSETS)
        setAssets(env.ASSETS);
    setMl(env?.ML_ENDPOINT, env?.ML_TOKEN);
    // executionCtx exists only in a real Workers runtime; without it
    // (tests, edge runtimes) yoga runs unbatched, which is fine here.
    let executionCtx;
    try {
        executionCtx = c.executionCtx;
    }
    catch {
        executionCtx = undefined;
    }
    let request = c.req.raw;
    // Legacy clients (the interscript.org demo) POST the GraphQL
    // document as the raw body with a non-JSON content type; the old
    // Lambda accepted that, so wrap it as {query} for Yoga.
    const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
    if (request.method === "POST" && !contentType.includes("application/json")) {
        const body = await request.text();
        let isJson = false;
        try {
            JSON.parse(body);
            isJson = true;
        }
        catch {
            // not JSON — a raw GraphQL document
        }
        if (body.trim() && !isJson) {
            request = new Request(request.url, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ query: body }),
            });
        }
    }
    return yoga.fetch(request, c.env, executionCtx);
});
export default app;
