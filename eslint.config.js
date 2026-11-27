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
]
