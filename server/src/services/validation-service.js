const { authorizeUser, authorizePlayer } = require("./auth/auth-service");
const { getGame } = require("./game-service");
const InvalidDataError = require("../errors/invalid-data");
const GameErrors = require("../errors/game/game-errors");
const { Roles, States } = require("../../../shared/constants/game-constants");
const { getUser } = require("./user-service");

/**
 * Validates request data using the provided Joi schema.
 * Tries to validate req.body first; if it fails, tries req.query.
 * If neither is valid, throws InvalidDataError with the error from body validation.
 * @param {object} req - Express request object
 * @param {object} schema - Joi schema
 * @returns {object} - Validated data
 */
function validateData(req, schema) {
  const bodyResult = schema.validate(req.body);
  if (!bodyResult.error) {
    return bodyResult.value;
  }

  const queryResult = schema.validate(req.query);
  if (!queryResult.error) {
    return queryResult.value;
  }

  // If both fail, prefer the error from query if query was present, otherwise from body
  if (req.query && Object.keys(req.query).length > 0 && queryResult.error) {
    throw new InvalidDataError(queryResult.error);
  }
  throw new InvalidDataError(bodyResult.error);
}

/**
 * Gets a user by ID and checks if they are authorized for a use case.
 * @param {string} reqUserId - The requesting user ID
 * @param {object} validData - Validated data
 * @param {string[]} useCaseRoles - Allowed roles
 * @param {Function} [error] - Error constructor for unauthorized
 * @param {Function} [missingError] - Error constructor for missing user
 * @returns {Promise<object>} The user object
 */
async function getUseCaseAuthorizedUser(
  reqUserId,
  validData,
  useCaseRoles,
  error = GameErrors.UserNotAuthorized,
  missingError,
) {
  let user = await getUser(reqUserId, missingError);
  await authorizeUser(user, useCaseRoles, error);
  if (validData.userId) {
    if (user.id !== validData.userId && user.role !== Roles.ADMIN) {
      throw new error(validData);
    } else {
      return getUser(validData.userId, missingError);
    }
  }
  return user;
}

/**
 * Validates request data and gets the authorized user.
 * @param {object} req - Express request object
 * @param {object} schema - Joi schema
 * @param {string[]} [roles] - Allowed roles
 * @param {Function} [error] - Error constructor for unauthorized
 * @param {Function} [missingError] - Error constructor for missing user
 * @returns {Promise<{validData: object, user: object}>}
 */
async function validateAndGetUser(
  req,
  schema,
  roles = Roles.ALL,
  error,
  missingError,
) {
  const validData = validateData(req, schema);
  const user = await getUseCaseAuthorizedUser(
    req.user.id,
    validData,
    roles,
    error,
    missingError,
  );

  return { validData, user };
}

/**
 * Validates request data and gets the authorized user and game.
 * @param {object} req - Express request object
 * @param {object} schema - Joi schema
 * @param {string[]} [roles] - Allowed roles
 * @returns {Promise<{validData: object, user: object, game: object}>}
 */
async function validateAndGetGame(req, schema, roles = Roles.ALL) {
  const { validData, user } = await validateAndGetUser(req, schema, roles);
  const { gameId, gameCode, id, code } = validData;
  const game = await getGame(
    gameId || id,
    gameCode || code,
    GameErrors.GameDoesNotExist,
  );
  return { validData, user, game };
}

/**
 * Validates request data, authorizes user, fetches game, and authorizes player role.
 * @param {object} req - Express request object
 * @param {object} schema - Validation schema
 * @param {string[]} [roles] - Optional roles to check (e.g., ["admin"])
 * @param {Function} [PlayerNotAuthorized] - Error to throw if player is not authorized
 * @returns {Promise<{validData: object, user: object, game: object}>}
 */
async function validateAndAuthorizeForGame(
  req,
  schema,
  PlayerNotAuthorized,
  roles = Roles.ALL,
) {
  const { validData, user, game } = await validateAndGetGame(
    req,
    schema,
    roles,
  );

  await authorizePlayer(user, game, PlayerNotAuthorized);
  return { validData, user, game };
}

/**
 * Validates request data, authorizes user, fetches game, and checks conditions for closing the game.
 *
 * - Verifies that the user is in playerList, otherwise throws PlayerNotAuthorized.
 * - If at least 2 other players have ready: true, throws PlayerNotAuthorized.
 * - If no one has ready: true, no one has the 'ready' key, and there are more than 2 other players, throws PlayerNotAuthorized.
 * - If there are only 2 players in the game (including the user), no error is thrown.
 *
 * @param {object} req - Express request object
 * @param {object} schema - Validation schema
 * @param {Function} PlayerNotAuthorized - Error to throw if player is not authorized
 * @param {string[]} [roles] - Optional roles to check (default: Roles.ALL)
 * @returns {Promise<{validData: object, user: object, game: object}>}
 */
async function validateAndAuthorizeForCloseGame(
  req,
  schema,
  PlayerNotAuthorized,
  roles = Roles.ALL,
) {
  const { validData, user, game } = await validateAndGetGame(
    req,
    schema,
    roles,
  );

  // If user is admin, skip all validation and authorize
  if (user.role === Roles.ADMIN) {
    return { validData, user, game };
  }

  // Game must be in 'finished' state for non-admins
  if (game.state !== States.FINISHED) {
    throw new PlayerNotAuthorized(validData);
  }

  let userFound = false;
  let readyCount = 0;

  for (let player of game.playerList) {
    if (player.userId === user.id) {
      userFound = true;
      continue;
    }
    if (player.ready === true) readyCount++;
  }

  if (!userFound || readyCount >= 2) {
    throw new PlayerNotAuthorized(validData);
  }

  return { validData, user, game };
}

module.exports = {
  validateData,
  validateAndGetGame,
  validateAndGetUser,
  validateAndAuthorizeForGame,
  validateAndAuthorizeForCloseGame,
  getUseCaseAuthorizedUser,
};
