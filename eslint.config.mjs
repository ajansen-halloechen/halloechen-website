// @ts-check
import eslintConfigPrettier from "eslint-config-prettier/flat";
import withNuxt from "./.nuxt/eslint.config.mjs";
import halloechen from "./eslint/plugin.mjs";

export default withNuxt(
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },

  {
    name: "app/files-to-ignore",
    ignores: [
      "**/dist/**",
      "**/dist-ssr/**",
      "**/coverage/**",
      "**/src/clients.gen/**",
    ],
  },

  {
    name: "app/no-external-repository-imports",
    files: ["**/*.{ts,mts,tsx,vue}"],
    plugins: {
      halloechen,
    },
    rules: {
      "halloechen/no-external-repository-imports": "error",
    },
  },

  // Must be last: disables ESLint formatting rules that conflict with Prettier.
  eslintConfigPrettier,
);
