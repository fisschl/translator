import { defineConfig } from "oxlint";

export const ignorePatterns = [
  ".agents/**",
  "dist/**",
  "auto-imports.d.ts",
  "components.d.ts",
  "typed-router.d.ts",
];

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "vue", "vitest", "promise"],
  ignorePatterns,
  env: {
    browser: true,
  },
  rules: {
    "import/default": "off",
  },
});
