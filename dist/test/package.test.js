import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, normalize, resolve } from "node:path";
import { describe, expect, it } from "vitest";
/** npm pack lists tarball paths without './' prefixes; manifest fields
 * carry them. Normalize both sides before comparing. */
function tarballPath(p) {
    return normalize(p).replace(/^\.\//, "");
}
function pack() {
    const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    const [packument] = JSON.parse(output);
    expect(packument).toBeDefined();
    if (!packument)
        throw new Error("npm pack produced no package metadata");
    return packument;
}
describe("npm package contents", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    it("does not publish the map corpus as package files", () => {
        const paths = pack().files.map((file) => file.path);
        // The map corpus (and anything else under maps/) is a deployment
        // artifact fetched from interscript/maps releases — never a
        // package file. This is the guard that failed when a shipped
        // package.json listed `maps` in files (251MB tarball).
        expect(paths.some((path) => path.startsWith("maps/"))).toBe(false);
        expect(paths.some((path) => path.startsWith("dist/test/"))).toBe(false);
        expect(paths.some((path) => path === "dist/src/maps.js")).toBe(false);
        expect(pack().unpackedSize).toBeLessThan(1_000_000);
    });
    it("keeps the node ONNX backend out of the published bundle", () => {
        // The plane session dynamically imports "onnxruntime-node"; the
        // build marks it external so the bundle only carries the import
        // specifier. If the bundler ever absorbs the package, Workers
        // deployments break on its native .node binaries.
        const bundle = readFileSync("dist/src/index.js", "utf8");
        expect(bundle).not.toContain("napi-v6");
        expect(bundle).not.toContain("onnxruntime_binding");
    });
    it("ships every file listed in package.json `files` (no phantom entries)", () => {
        const paths = pack().files.map((file) => file.path);
        for (const entry of pkg.files) {
            expect(paths, `package.json files entry missing from the tarball: ${entry}`).toContain(tarballPath(entry));
        }
    });
    it("ships every declaration file the public types reference", () => {
        // The public surface is index.d.ts; every relative './x.js' import
        // inside a SHIPPED .d.ts must itself resolve to a shipped file —
        // otherwise TypeScript consumers of the package break.
        const paths = pack().files.map((file) => file.path);
        const shippedDeclarations = paths.filter((p) => p.endsWith(".d.ts"));
        expect(shippedDeclarations).toContain("dist/src/index.d.ts");
        const referenced = new Set();
        for (const decl of shippedDeclarations) {
            const text = readFileSync(resolve(decl), "utf8");
            for (const m of text.matchAll(/from\s+"(\.\/[^"]+)"/g)) {
                referenced.add(tarballPath(`${dirname(decl)}/${m[1].replace(/\.js$/, ".d.ts")}`));
            }
        }
        for (const ref of referenced) {
            expect(paths, `shipped ${ref} is imported but not packaged`).toContain(ref);
        }
    });
    it("resolves the package entry points from the manifest", () => {
        const paths = pack().files.map((file) => file.path);
        expect(paths).toContain("dist/src/index.js");
        expect(paths).toContain("dist/src/index.d.ts");
        for (const entry of ["main", "types"]) {
            expect(paths, `package.json ${entry} (${pkg[entry]}) is not packaged`).toContain(tarballPath(pkg[entry]));
        }
        expect(Object.keys(pkg.exports)).toContain(".");
    });
});
