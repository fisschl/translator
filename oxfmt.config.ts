import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: [
    "**/.agents/**",
    "**/assets/**",
    "**/dist/**",
    "**/*.d.ts",
    "**/*.js",
    "**/*.mjs",
    "**/coverage/**",
  ],
  sortImports: {
    newlinesBetween: false,
  },
});
