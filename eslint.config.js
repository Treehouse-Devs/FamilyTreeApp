import js from "@eslint/js";
import tseslint from "typescript-eslint";
import * as path from "path";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ["**/*.ts", "**/*.tsx"],
    globalIgnores: ["node_modules", "dist", "build"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: path.resolve(),
      },
    },
    plugins: {
      "unused-imports": require("eslint-plugin-unused-imports"),
      import: require("eslint-plugin-import"),
      react: require("eslint-plugin-react"),
      "react-native": require("eslint-plugin-react-native"),
      node: require("eslint-plugin-node"),
      jsdoc: require("eslint-plugin-jsdoc"),
    },
    rules: {
      "unused-imports/no-unused-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      '@typescript-eslint/indent': ['error', 2],
      "no-console": "warn",
      indent: ['error', 2],
      "node/no-unsupported-features/es-syntax": "off",
      "node/no-missing-import": "off",
      "react-native/no-inline-styles": "off",
    },
  },
];
