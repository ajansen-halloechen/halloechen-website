// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

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
    name: "app/no-direct-repository-imports",
    files: ["**/*.{ts,mts,tsx,vue}"],
    ignores: ["server/entities/**/*.service.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*/*.repository", "*/*.repository.ts"],
              message:
                "Repositories are internal to their entity. Import the entity's service instead.",
            },
          ],
        },
      ],
    },
  },
);
