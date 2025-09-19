const TokenHashRepository = require("../models/token-hash-repository");
const { generateGameCode } = require("../utils/code-helper");
const tokenHashRepo = new TokenHashRepository();

/**
 * Creates a new token hash for the given user ID and stores it in the repository.
 * @param {string} userId - The user ID
 * @returns {Promise<object>} The created token object
 */
async function createTokenHash(userId) {
  const hash = generateGameCode();
  const token = await tokenHashRepo.create(userId, hash);
  return { ...token };
}

module.exports = { createTokenHash };
