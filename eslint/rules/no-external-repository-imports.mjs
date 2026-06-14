/** @import { Rule } from "eslint" */

const REPOSITORY_ENTITY_PATTERN = /([^/]+)\.repository$/;
const OWN_ENTITY_SERVICE_PATTERN =
  /(?:^|\/)server\/entities\/([^/]+)\/\1\.service\.(?:ts|mts)$/;

/**
 * @param {string} importPath
 * @returns {string | null}
 */
function getRepositoryEntity(importPath) {
  const match = importPath.match(REPOSITORY_ENTITY_PATTERN);
  return match?.[1] ?? null;
}

/**
 * @param {string} filePath
 * @returns {string | null}
 */
function getOwnEntityServiceEntity(filePath) {
  const normalized = filePath.replaceAll("\\", "/");
  const match = normalized.match(OWN_ENTITY_SERVICE_PATTERN);
  return match?.[1] ?? null;
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {import("estree").Node} node
 * @param {string} importPath
 */
function checkImportPath(context, node, importPath) {
  const repositoryEntity = getRepositoryEntity(importPath);
  if (!repositoryEntity) {
    return;
  }

  const ownEntity = getOwnEntityServiceEntity(context.filename);
  if (ownEntity === repositoryEntity) {
    return;
  }

  context.report({
    node,
    messageId: "externalRepositoryImport",
    data: { repositoryEntity },
  });
}

/** @type {Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Repositories may only be imported from their own entity service.",
    },
    schema: [],
    messages: {
      externalRepositoryImport:
        "Repository '{{repositoryEntity}}' may only be imported from '{{repositoryEntity}}.service.ts'. Import '{{repositoryEntity}}Service' instead.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        checkImportPath(context, node.source, node.source.value);
      },
      ExportNamedDeclaration(node) {
        if (node.source) {
          checkImportPath(context, node.source, node.source.value);
        }
      },
      ExportAllDeclaration(node) {
        checkImportPath(context, node.source, node.source.value);
      },
    };
  },
};
