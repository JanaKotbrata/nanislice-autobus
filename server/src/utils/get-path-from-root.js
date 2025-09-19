const path = require("path");

/**
 * Resolves an absolute path from the project root for the given directory.
 * @param {string} directory - Relative directory path from the project root
 * @returns {string} Absolute path
 */
function getPathFromRoot(directory) {
  return path.resolve(__dirname, "..", directory);
}

module.exports = getPathFromRoot;
