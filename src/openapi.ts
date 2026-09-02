/**
 * The OpenAPI 3.1 document for REST v1 — served at /openapi.json.
 * Hand-maintained to mirror src/rest.ts exactly.
 */
export const OPENAPI = {
  openapi: "3.1.0",
  info: {
    title: "Interscript API",
    version: "1.0.0",
    description:
      "Transliteration and neural text processing. Maps run in-edge on the interscript-ts native interpreter (289 systems); neural models (diacritization, grapheme-to-phoneme) run on Interscript's inference service. GraphQL remains available at POST /graphql.",
    license: { name: "BSD-3-Clause" },
  },
  servers: [{ url: "https://api.interscript.org" }],
  tags: [
    { name: "service" },
    { name: "maps" },
    { name: "transliteration" },
    { name: "models" },
    { name: "inference" },
  ],
  paths: {
    "/": {
      get: {
        tags: ["service"],
        summary: "Service index",
        responses: { "200": { $ref: "#/components/responses/Ok" } },
      },
    },
    "/v1/info": {
      get: {
        tags: ["service"],
        summary: "Version and capability summary",
        responses: { "200": { $ref: "#/components/responses/Ok" } },
      },
    },
    "/v1/maps": {
      get: {
        tags: ["maps"],
        summary: "Every bundled transliteration system code",
        responses: { "200": { $ref: "#/components/responses/Ok" } },
      },
    },
    "/v1/maps/{code}": {
      get: {
        tags: ["maps"],
        summary: "One system's compiled map (JSON IR)",
        parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { $ref: "#/components/responses/Ok" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/v1/transliterate": {
      post: {
        tags: ["transliteration"],
        summary: "Transliterate text with a system",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TransliterateRequest" },
              examples: {
                gek: {
                  value: { system: "ungegn-kor-Kore-Latn-1939", input: "평양" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Transliterated output",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TransliterateResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "413": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/v1/detect": {
      post: {
        tags: ["transliteration"],
        summary: "Rank systems by how well they map input to output",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DetectRequest" },
            },
          },
        },
        responses: { "200": { $ref: "#/components/responses/Ok" } },
      },
    },
    "/v1/models": {
      get: {
        tags: ["models"],
        summary: "The neural model index (IMF v1)",
        responses: { "200": { $ref: "#/components/responses/Ok" } },
      },
    },
    "/v1/models/{id}": {
      get: {
        tags: ["models"],
        summary: "One model's full entry (metrics, parity, download)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { $ref: "#/components/responses/Ok" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/v1/infer/batch": {
      post: {
        tags: ["inference"],
        summary: "Batch neural inference",
        description: "Up to 50 inputs per request against one model; per-item error isolation.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  model: { type: "string" },
                  inputs: { type: "array", items: { type: "string" }, maxItems: 50 },
                },
                required: ["model", "inputs"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Per-item results" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/v1/assets/{tag}/{file}": {
      get: {
        tags: ["maps"],
        summary: "Release asset (CORS proxy)",
        description: "Streaming pass-through to GitHub Releases assets with permissive CORS.",
        parameters: [
          { name: "tag", in: "path", required: true, schema: { type: "string" } },
          { name: "file", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Asset bytes" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/v1/infer": {
      post: {
        tags: ["inference"],
        summary: "Run a neural model (diacritization or G2P)",
        description:
          "Proxy to Interscript's inference service. Only models whose task is diacritization or g2p are served; see GET /v1/models for the catalog.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InferRequest" },
              examples: {
                hebrew: {
                  value: { model: "heb-diac-1.0", input: "שלום עליכם" },
                  summary: "Hebrew nikud restoration",
                },
                urdu: {
                  value: { model: "urd-g2p-1.0", input: "اردو" },
                  summary: "Urdu grapheme-to-phoneme",
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Model output",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InferResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "502": { $ref: "#/components/responses/Error" },
          "503": { $ref: "#/components/responses/Error" },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      TransliterateRequest: {
        type: "object",
        required: ["system", "input"],
        properties: {
          system: {
            type: "string",
            description: "A system code from GET /v1/maps",
            examples: ["ungegn-kor-Kore-Latn-1939"],
          },
          input: { type: "string", maxLength: 1000000 },
        },
      },
      TransliterateResponse: {
        type: "object",
        properties: {
          system: { type: "string" },
          input: { type: "string" },
          output: { type: "string" },
        },
      },
      DetectRequest: {
        type: "object",
        required: ["input", "output"],
        properties: {
          input: { type: "string" },
          output: { type: "string" },
        },
      },
      InferRequest: {
        type: "object",
        required: ["model", "input"],
        properties: {
          model: {
            type: "string",
            description: "A model id from GET /v1/models",
            examples: ["heb-diac-1.0"],
          },
          input: { type: "string", maxLength: 4000 },
        },
      },
      InferResponse: {
        type: "object",
        properties: {
          model: { type: "string" },
          task: { type: "string", enum: ["diacritization", "g2p"] },
          input: { type: "string" },
          output: { type: "string" },
        },
      },
    },
    responses: {
      Ok: {
        description: "Success",
        content: { "application/json": { schema: { type: "object" } } },
      },
      NotFound: {
        description: "Unknown system or model",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      Error: {
        description: "Error",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
  },
} as const
