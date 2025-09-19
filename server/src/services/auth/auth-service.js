const { getGamePlayer } = require("../game-service");
const { Roles } = require("../../../../shared/constants/game-constants.json");
const jwt = require("jsonwebtoken");
const { downloadAvatar } = require("../avatar-service");
const { createTokenHash } = require("../token-service");
const ServerConfig = require("../../../config/config.json");
const UriConfig = require("../../../../shared/config/config.json");
const GameErrors = require("../../errors/game/game-errors");

async function authorizeUser(
  user,
  requiredRoles = Roles.ALL,
  error = GameErrors.UserNotAuthorized,
) {
  if (!requiredRoles.includes(user.role)) {
    throw new error(user);
  }
  return user;
}

async function authorizePlayer(user, game, authError) {
  const player = getGamePlayer(game, user.id);
  if (user.role !== Roles.ADMIN && !player?.creator) {
    throw new authError(user.id);
  }
  return player;
}

// --- OAUTH UTILITIES ---

/**
 * Finds or creates a user by OAuth profile across platforms.
 * @param {Object} params
 * @param {Object} users - UsersRepository instance
 * @param {string} platform - 'discord' | 'google' | 'seznam'
 * @param {Object} profile - Normalized profile: { id, email, username, avatarUrl }
 * @returns {Promise<Object>} user
 */
async function findOrCreateOAuthUser({ users, platform, profile }) {
  let user;
  if (platform === "discord") {
    user = await users.getByDiscordId(profile.id);
  } else if (platform === "google") {
    user = await users.getByGoogleId(profile.id);
  } else if (platform === "seznam") {
    user = await users.getBySeznamId(profile.id);
  }

  if (!user && profile.email) {
    user = await users.getByEmail(profile.email);
  }

  if (!user) {
    const userData = {};
    if (platform === "discord") userData.discordId = profile.id;
    if (platform === "google") userData.googleId = profile.id;
    if (platform === "seznam") userData.seznamId = profile.id;
    user = await users.create(
      userData,
      profile.email,
      profile.username,
      profile.avatarUrl || null,
    );
  } else {
    const update = {};
    if (platform === "discord" && !user.discordId)
      update.discordId = profile.id;
    if (platform === "google" && !user.googleId) update.googleId = profile.id;
    if (platform === "seznam" && !user.seznamId) update.seznamId = profile.id;
    if (Object.keys(update).length > 0) {
      update.sys = user.sys;
      user = await users.update(user.id, update);
    }
  }

  await downloadAvatar(user.picture, user.id);

  return await users.getById(user.id);
}

/**
 * Handler for the final OAuth callback route (generates token and redirects)
 * @param {Object} req
 * @param {Object} res
 * @param {Object} [options]
 * @param {boolean} [options.includeUserId] - whether to add userId to query
 */
async function handleOAuthCallback(req, res, options = {}) {
  const JWT_SECRET = ServerConfig.secret;
  const { hash } = await createTokenHash(req.user.id);
  const token = jwt.sign({ id: req.user.id, loginHash: hash }, JWT_SECRET, {
    expiresIn: "24h",
  });
  let redirectUrl = `${UriConfig.CLIENT_URI}/auth-callback?token=${token}`;
  if (options.includeUserId) {
    redirectUrl += `&userId=${req.user.id}`;
  }
  res.redirect(redirectUrl);
}

module.exports = {
  authorizeUser,
  authorizePlayer,
  findOrCreateOAuthUser,
  handleOAuthCallback,
};
