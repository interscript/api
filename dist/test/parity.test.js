/**
 * Parity gate: fixtures recorded from the production Ruby API must
 * replay byte-identically through this implementation. Zero-diff is the
 * release gate (see scripts/record-fixtures.mjs).
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { app } from "../src/server.js";
const env = {
    ASSETS: {
        fetch: async (url) => {
            const path = typeof url === "string" ? url : url.url;
            const name = path.substring(path.lastIndexOf("/") + 1);
            const code = name.replace(".json", "");
            try {
                return new Response(readFileSync(`maps/${code}.json`), { status: 200 });
            }
            catch {
                return new Response(null, { status: 404 });
            }
        },
    },
};
const fixtures = JSON.parse(readFileSync("test/fixtures/parity.json", "utf-8"));
async function run(query) {
    const response = await app.request("https://example.org/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
    }, env);
    return (await response.json());
}
describe("production parity", () => {
    it("replays every recorded fixture byte-identically", async () => {
        const replay = async () => {
            for (const fixture of fixtures) {
                let query;
                if (fixture.kind === "transliterate") {
                    query = `{ transliterate(systemCode: ${JSON.stringify(fixture.systemCode)}, input: ${JSON.stringify(fixture.input)}) }`;
                }
                else if (fixture.kind === "detect") {
                    query = `{ detect(input: ${JSON.stringify(fixture.input)}, output: ${JSON.stringify(fixture.output)}) { mapName distance } }`;
                }
                else {
                    query = "{ info }";
                }
                const ours = await run(query);
                const expected = fixture.result;
                // info carries our own version string by design; compare the shape.
                if (fixture.kind === "info") {
                    expect(Object.keys(ours.data ?? {})).toEqual(["info"]);
                    continue;
                }
                expect(ours.data ?? ours.errors).toEqual(expected.data ?? expected.errors);
            }
        };
        await replay();
    }, 120_000);
});
