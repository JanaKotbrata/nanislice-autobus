const traverseDirectory = require("./traverse-directory");
const { connectToDb } = require("../models/connection-db");

/**
 * Initializes a repository and creates its indexes in the database.
 * @param {string} fullPath - Full path to the repository file
 * @returns {Promise<void>}
 */
async function initRepository(fullPath) {
  const repository = require(fullPath);
  const repo = new repository();
  //create indexes will execute when connection to db is ready
  await connectToDb();
  return repo.createIndexes();
}

/**
 * Recursively creates indexes for all repositories in the given directory.
 * @param {string} directory - Path to the directory containing repositories
 * @returns {Promise<void>}
 */
async function createIndexes(directory) {
  const promises = [];
  traverseDirectory(directory, "repository.js", (fullPath) =>
    promises.push(initRepository(fullPath)),
  );
  await Promise.all(promises);
}

module.exports = createIndexes;
