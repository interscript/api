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
import { detectResolver, info, setAssets, systemCodesResolver, transliterateResolver, } from "./resolvers.js";
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
app.all("*", (c) => {
    const env = c.env;
    console.log("C.ENV:", env && Object.keys(env));
    if (env?.ASSETS)
        setAssets(env.ASSETS);
    // executionCtx exists only in a real Workers runtime; without it
    // (tests, edge runtimes) yoga runs unbatched, which is fine here.
    let executionCtx;
    try {
        executionCtx = c.executionCtx;
    }
    catch {
        executionCtx = undefined;
    }
    return yoga.fetch(c.req.raw, c.env, executionCtx);
});
export default app;
