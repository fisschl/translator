import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "vue", "vitest", "promise"],
  ignorePatterns: [
    "**/.agents/**",
    "**/assets/**",
    "**/dist/**",
    "**/*.d.ts",
    "**/*.js",
    "**/*.mjs",
    "**/coverage/**",
  ],
  env: {
    browser: true,
  },
  rules: {
    "import/default": "off",
  },
});
