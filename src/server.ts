/**
 * The Worker: Hono router + GraphQL Yoga executor.
 *
 * Route parity with the AWS deployment: GraphQL answers on POST to any
 * path (API Gateway was `{proxy+}`); OPTIONS returns the CORS preflight.
 */
import { createYoga, createSchema } from "graphql-yoga"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { typeDefs } from "./schema.js"
import {
  detectResolver,
  info,
  setAssets,
  systemCodesResolver,
  transliterateResolver,
  type Env,
} from "./resolvers.js"

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
})

export const app = new Hono()

app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"] }))

app.all("*", (c) => {
  const env = c.env as Env | undefined
  if (env?.ASSETS) setAssets(env.ASSETS)
  // executionCtx exists only in a real Workers runtime; without it
  // (tests, edge runtimes) yoga runs unbatched, which is fine here.
  let executionCtx: unknown
  try {
    executionCtx = c.executionCtx
  } catch {
    executionCtx = undefined
  }
  return yoga.fetch(
    c.req.raw as unknown as Parameters<typeof yoga.fetch>[0],
    c.env as never,
    executionCtx as never,
  )
})

export default app
