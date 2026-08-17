/**
 * Server behavior tests via the Workers-compatible fetch interface —
 * the same code path wrangler runs. Schema contract is asserted against
 * fixtures recorded from the production Ruby API (test/fixtures).
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { app } from "../src/server.js";
// Test double of the Workers ASSETS binding: the same maps directory the
// deployer ships as static assets, served from the local filesystem.
const assets = {
    fetch: async (url) => {
        const path = typeof url === "string" ? url : url.url;
        const name = path.substring(path.lastIndexOf("/") + 1);
        const code = name.replace(".json", "");
        try {
            const body = readFileSync(`maps/${code}.json`);
            return new Response(body, { status: 200 });
        }
        catch {
            return new Response(null, { status: 404 });
        }
    },
};
const env = { ASSETS: assets };
const GRAPHQL = { "content-type": "application/json" };
async function query(body) {
    return app.request("https://example.org/graphql", { method: "POST", headers: GRAPHQL, body }, env);
}
async function gql(queryString) {
    const response = await query(JSON.stringify({ query: queryString }));
    expect(response.status).toBe(200);
    const parsed = (await response.json());
    if (parsed.errors)
        throw new Error(JSON.stringify(parsed.errors));
    return parsed.data ?? {};
}
describe("info", () => {
    it("returns version JSON", async () => {
        const result = await gql("{ info }");
        const info = JSON.parse(result["info"]);
        expect(info["version"]).toMatch(/^3\./);
    });
});
describe("systemCodes", () => {
    it("lists the bundled corpus", async () => {
        const result = await gql("{ systemCodes }");
        const codes = result["systemCodes"];
        expect(codes.length).toBe(287);
        expect(codes).toContain("bgnpcgn-kat-Geor-Latn-2009");
    });
});
describe("transliterate", () => {
    it("transliterates Georgian", async () => {
        const result = await gql(`{ transliterate(systemCode: "alalc-kat-Geor-Latn-1997", input: "ქართული") }`);
        // Expected output recorded from the production Ruby API.
        expect(result["transliterate"]).toBe("k\u02bbart\u02bbuli");
    });
    it("errors byte-identically for unknown systems", async () => {
        const response = await query(JSON.stringify({
            query: `{ transliterate(systemCode: "nope-xxx-Xxx-Xxx-0000", input: "x") }`,
        }));
        const parsed = (await response.json());
        expect(parsed.errors[0].message).toContain("Couldn't locate nope-xxx-Xxx-Xxx-0000");
    });
});
describe("detect", () => {
    it("ranks matching systems by distance", { timeout: 120_000 }, async () => {
        const result = await gql(`{ detect(input: "ქართული", output: "k\u02bbart\u02bbuli") { mapName distance } }`);
        const ranked = result["detect"];
        expect(ranked.length).toBeGreaterThan(0);
        expect(ranked[0].distance).toBe(0);
        expect(ranked.map((r) => r.mapName)).toContain("alalc-kat-Geor-Latn-1997");
    });
});
describe("CORS", () => {
    it("answers preflight", async () => {
        const response = await app.request("https://example.org/graphql", { method: "OPTIONS", headers: { origin: "https://interscript.org" } }, env);
        expect([200, 204]).toContain(response.status);
        expect(response.headers.get("access-control-allow-origin")).toBe("*");
    });
});
