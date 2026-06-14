import noExternalRepositoryImports from "./rules/no-external-repository-imports.mjs";

/** @type {import("eslint").ESLint.Plugin} */
export default {
  rules: {
    "no-external-repository-imports": noExternalRepositoryImports,
  },
};
