// eslint.config.mjs
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  // Specify which files to lint
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["node_modules", "dist"],
  },

  // JS files that use CommonJS syntax
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },

  // Shared language settings (applies to all files)
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // === ESLint core rules ===
      "no-unused-vars": "error",
      "prefer-const": "error",
      "no-unused-expressions": "error",
      "no-undef": "error",
      "no-console": "off",

      // === TypeScript-specific rules ===
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // === Prettier ===
      ...prettier.rules,
    },
  },

  // ESLint recommended + TypeScript recommended configs
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];