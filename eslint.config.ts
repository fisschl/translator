import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginOxlint from "eslint-plugin-oxlint";
import pluginVue from "eslint-plugin-vue";
import { globalIgnores } from "eslint/config";

export default defineConfigWithVueTs(
  ...pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  ...pluginOxlint.buildFromOxlintConfigFile(".oxlintrc.json"),
  globalIgnores([
    "**/.agents/**",
    "**/assets/**",
    "**/dist/**",
    "**/*.d.ts",
    "**/*.js",
    "**/*.mjs",
    "**/coverage/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": "off",
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        { registeredComponentsOnly: false },
      ],
      "vue/define-props-declaration": ["error", "type-based"],
      "vue/define-emits-declaration": ["error", "type-based"],
      "vue/enforce-style-attribute": ["error", { allow: ["module"] }],
      "vue/html-button-has-type": "error",
      "vue/no-import-compiler-macros": "error",
      "vue/no-static-inline-styles": "error",
      "vue/no-multiple-objects-in-class": "error",
      "vue/padding-line-between-blocks": "error",
      "vue/prefer-use-template-ref": "error",
      "vue/require-macro-variable-name": "error",
      "vue/require-typed-ref": "error",
      "vue/max-attributes-per-line": "off",
      "vue/html-indent": "off",
    },
  },
);
