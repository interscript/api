/**
 * The OpenAPI 3.1 document for REST v1 — served at /openapi.json.
 * Hand-maintained to mirror src/rest.ts exactly.
 */
export declare const OPENAPI: {
    readonly openapi: "3.1.0";
    readonly info: {
        readonly title: "Interscript API";
        readonly version: "1.0.0";
        readonly description: "Transliteration and neural text processing. Maps run in-edge on the interscript-ts native interpreter (289 systems); neural models (diacritization, grapheme-to-phoneme) run on Interscript's inference service. GraphQL remains available at POST /graphql.";
        readonly license: {
            readonly name: "BSD-3-Clause";
        };
    };
    readonly servers: readonly [{
        readonly url: "https://api.interscript.org";
    }];
    readonly tags: readonly [{
        readonly name: "service";
    }, {
        readonly name: "maps";
    }, {
        readonly name: "transliteration";
    }, {
        readonly name: "models";
    }, {
        readonly name: "inference";
    }];
    readonly paths: {
        readonly "/": {
            readonly get: {
                readonly tags: readonly ["service"];
                readonly summary: "Service index";
                readonly responses: {
                    readonly "200": {
                        readonly $ref: "#/components/responses/Ok";
                    };
                };
            };
        };
        readonly "/v1/info": {
            readonly get: {
                readonly tags: readonly ["service"];
                readonly summary: "Version and capability summary";
                readonly responses: {
                    readonly "200": {
                        readonly $ref: "#/components/responses/Ok";
                    };
                };
            };
        };
        readonly "/v1/maps": {
            readonly get: {
                readonly tags: readonly ["maps"];
                readonly summary: "Every bundled transliteration system code";
                readonly responses: {
                    readonly "200": {
                        readonly $ref: "#/components/responses/Ok";
                    };
                };
            };
        };
        readonly "/v1/maps/{code}": {
            readonly get: {
                readonly tags: readonly ["maps"];
                readonly summary: "One system's compiled map (JSON IR)";
                readonly parameters: readonly [{
                    readonly name: "code";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly $ref: "#/components/responses/Ok";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
        };
        readonly "/v1/transliterate": {
            readonly post: {
                readonly tags: readonly ["transliteration"];
                readonly summary: "Transliterate text with a system";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/TransliterateRequest";
                            };
                            readonly examples: {
                                readonly gek: {
                                    readonly value: {
                                        readonly system: "ungegn-kor-Kore-Latn-1939";
                                        readonly input: "평양";
                                    };
                                };
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly description: "Transliterated output";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly $ref: "#/components/schemas/TransliterateResponse";
                                };
                            };
                        };
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                    readonly "413": {
                        readonly $ref: "#/components/responses/Error";
                    };
                };
            };
        };
        readonly "/v1/detect": {
            readonly post: {
                readonly tags: readonly ["transliteration"];
                readonly summary: "Rank systems by how well they map input to output";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/DetectRequest";
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly $ref: "#/components/responses/Ok";
                    };
                };
            };
        };
        readonly "/v1/models": {
            readonly get: {
                readonly tags: readonly ["models"];
                readonly summary: "The neural model index (IMF v1)";
                readonly responses: {
                    readonly "200": {
                        readonly $ref: "#/components/responses/Ok";
                    };
                };
            };
        };
        readonly "/v1/models/{id}": {
            readonly get: {
                readonly tags: readonly ["models"];
                readonly summary: "One model's full entry (metrics, parity, download)";
                readonly parameters: readonly [{
                    readonly name: "id";
                    readonly in: "path";
                    readonly required: true;
                    readonly schema: {
                        readonly type: "string";
                    };
                }];
                readonly responses: {
                    readonly "200": {
                        readonly $ref: "#/components/responses/Ok";
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                };
            };
        };
        readonly "/v1/infer": {
            readonly post: {
                readonly tags: readonly ["inference"];
                readonly summary: "Run a neural model (diacritization or G2P)";
                readonly description: "Proxy to Interscript's inference service. Only models whose task is diacritization or g2p are served; see GET /v1/models for the catalog.";
                readonly requestBody: {
                    readonly required: true;
                    readonly content: {
                        readonly "application/json": {
                            readonly schema: {
                                readonly $ref: "#/components/schemas/InferRequest";
                            };
                            readonly examples: {
                                readonly hebrew: {
                                    readonly value: {
                                        readonly model: "heb-diac-1.0";
                                        readonly input: "שלום עליכם";
                                    };
                                    readonly summary: "Hebrew nikud restoration";
                                };
                                readonly urdu: {
                                    readonly value: {
                                        readonly model: "urd-g2p-1.0";
                                        readonly input: "اردو";
                                    };
                                    readonly summary: "Urdu grapheme-to-phoneme";
                                };
                            };
                        };
                    };
                };
                readonly responses: {
                    readonly "200": {
                        readonly description: "Model output";
                        readonly content: {
                            readonly "application/json": {
                                readonly schema: {
                                    readonly $ref: "#/components/schemas/InferResponse";
                                };
                            };
                        };
                    };
                    readonly "404": {
                        readonly $ref: "#/components/responses/NotFound";
                    };
                    readonly "502": {
                        readonly $ref: "#/components/responses/Error";
                    };
                    readonly "503": {
                        readonly $ref: "#/components/responses/Error";
                    };
                };
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly Error: {
                readonly type: "object";
                readonly properties: {
                    readonly error: {
                        readonly type: "object";
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
            readonly TransliterateRequest: {
                readonly type: "object";
                readonly required: readonly ["system", "input"];
                readonly properties: {
                    readonly system: {
                        readonly type: "string";
                        readonly description: "A system code from GET /v1/maps";
                        readonly examples: readonly ["ungegn-kor-Kore-Latn-1939"];
                    };
                    readonly input: {
                        readonly type: "string";
                        readonly maxLength: 1000000;
                    };
                };
            };
            readonly TransliterateResponse: {
                readonly type: "object";
                readonly properties: {
                    readonly system: {
                        readonly type: "string";
                    };
                    readonly input: {
                        readonly type: "string";
                    };
                    readonly output: {
                        readonly type: "string";
                    };
                };
            };
            readonly DetectRequest: {
                readonly type: "object";
                readonly required: readonly ["input", "output"];
                readonly properties: {
                    readonly input: {
                        readonly type: "string";
                    };
                    readonly output: {
                        readonly type: "string";
                    };
                };
            };
            readonly InferRequest: {
                readonly type: "object";
                readonly required: readonly ["model", "input"];
                readonly properties: {
                    readonly model: {
                        readonly type: "string";
                        readonly description: "A model id from GET /v1/models";
                        readonly examples: readonly ["heb-diac-1.0"];
                    };
                    readonly input: {
                        readonly type: "string";
                        readonly maxLength: 4000;
                    };
                };
            };
            readonly InferResponse: {
                readonly type: "object";
                readonly properties: {
                    readonly model: {
                        readonly type: "string";
                    };
                    readonly task: {
                        readonly type: "string";
                        readonly enum: readonly ["diacritization", "g2p"];
                    };
                    readonly input: {
                        readonly type: "string";
                    };
                    readonly output: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly responses: {
            readonly Ok: {
                readonly description: "Success";
                readonly content: {
                    readonly "application/json": {
                        readonly schema: {
                            readonly type: "object";
                        };
                    };
                };
            };
            readonly NotFound: {
                readonly description: "Unknown system or model";
                readonly content: {
                    readonly "application/json": {
                        readonly schema: {
                            readonly $ref: "#/components/schemas/Error";
                        };
                    };
                };
            };
            readonly Error: {
                readonly description: "Error";
                readonly content: {
                    readonly "application/json": {
                        readonly schema: {
                            readonly $ref: "#/components/schemas/Error";
                        };
                    };
                };
            };
        };
    };
};
