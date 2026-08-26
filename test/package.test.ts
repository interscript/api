import { execFileSync } from "node:child_process"
import { describe, expect, it } from "vitest"

describe("npm package contents", () => {
  it("does not publish the map corpus as package files", () => {
    const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
    const [packument] = JSON.parse(output) as Array<{
      size: number
      unpackedSize: number
      files: Array<{ path: string }>
    }>
    expect(packument).toBeDefined()
    if (!packument) throw new Error("npm pack produced no package metadata")

    const paths = packument.files.map((file) => file.path)

    expect(paths.some((path) => path.startsWith("maps/") && path.endsWith(".json"))).toBe(false)
    expect(paths.some((path) => path.startsWith("dist/test/"))).toBe(false)
    expect(packument.unpackedSize).toBeLessThan(1_000_000)
  })
})
