const TokenHashRepository = require('../models/token-hash-repository');
const {generateGameCode} = require("../utils/helpers");
const tokenHashRepo = new TokenHashRepository();

async function createTokenHash(userId) {
    const hash = generateGameCode()
    const token = await tokenHashRepo.createHash(userId, hash);
    return {...token}
}

module.exports = {createTokenHash}