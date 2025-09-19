const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

// Remove leading/trailing whitespace from all global keys
const cleanGlobals = Object.fromEntries(
  Object.entries(globals.browser).map(([key, value]) => [key.trim(), value]),
);

module.exports = [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...cleanGlobals,
        require: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        afterEach: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        beforeAll: "readonly",
        test: "readonly",
        jest: "readonly",
        __dirname: "readonly",
        global: "readonly",
        structuredClone: "readonly",
        process: "readonly",
        module: "readonly",
        Buffer: "readonly",
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      prettier: require("eslint-plugin-prettier"),
    },
    // Directly include Prettier config for flat config
    ...prettier,
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "prettier/prettier": ["warn"],
    },
  },
];
