import { defineConfig } from "vitest/config"

import { fileURLToPath } from "node:url"

export default defineConfig({
  resolve: {
    alias: {
      // tests run the REAL plane runtime from the local interscript-ts
      // checkout (the published package lags by one release)
      "interscript/ml": fileURLToPath(
        new URL("../interscript-ts/src/ml/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "vendor/**", "coverage/**"],
  },
})
