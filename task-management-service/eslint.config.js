const js = require("@eslint/js");
const typescript = require("@typescript-eslint/eslint-plugin");
const parser = require("@typescript-eslint/parser");
const prettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      "coverage/",
      "**/*.js",
      "**/*.d.ts",
      ".env*",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml"
    ]
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: parser,
      parserOptions: {
        project: "./tsconfig.json"
      },
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      "@typescript-eslint": typescript,
      "prettier": prettier
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      ...typescript.configs["recommended-requiring-type-checking"].rules,
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-var-requires": "error",
      "no-console": "warn",
      "no-debugger": "error"
    }
  }
];