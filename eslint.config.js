import js from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
  { ignores: ["dist", "maps", "node_modules", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Workers plane discipline: a promise that is never awaited or
    // returned silently drops errors and work (workerd cancels it when
    // the event loop drains). Type-aware rules need the tsconfig
    // project; src/ and test/ are its only members.
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
  {
    // ADR 0001: the map-data path compiles no regexes. New src/ modules
    // inherit the invariant by default; the two blessed exceptions below
    // are the August-2026 request handlers (input validation, output
    // escaping) — adding to that list is an ADR decision. The vendored
    // engine's internal per-rule RegExp is a dependency-pinned architecture
    // outside this rule's reach entirely.
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='RegExp']",
          message: "ADR 0001: this module compiles no regexes — see docs/adr/0001.",
        },
        {
          selector: "Literal[regex.pattern]",
          message: "ADR 0001: no regex literals in this module — see docs/adr/0001.",
        },
      ],
    },
  },
  {
    // ADR 0001 named exceptions: request-shape handling in the blessed
    // August 2026 snapshot (static, bounded patterns only).
    files: ["src/rest.ts", "src/docs.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
]
