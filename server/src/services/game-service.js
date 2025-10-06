const { initDeck, dealCardPerPlayer, shuffleDeck } = require("./card-service");
const GamesRepository = require("../models/games-repository");
const GameErrors = require("../errors/game/game-errors");
const { States } = require("../../../shared/constants/game-constants.json");
const GameWarnings = require("../errors/game/game-warnings");
const games = new GamesRepository();

/**
 * Initializes and deals a deck to all players.
 * @param {Array} playerList - List of player objects
 * @returns {{deck: Array, playerList: Array}}
 */
function initializeAndDealDeck(playerList) {
  const fullDeck = initDeck(playerList);
  const [deck, newPlayerList] = dealCardPerPlayer(fullDeck, playerList);
  return { deck, playerList: newPlayerList };
}

/**
 * Gets a player object from a game by user ID.
 * @param {object} game - The game object
 * @param {string} userId - The user ID
 * @returns {object|undefined} The player object or undefined
 */
function getGamePlayer(game, userId) {
  return game.playerList.find((player) => player.userId === userId);
}

/**
 * Gets a player object from a game by user ID or throws if not found.
 * @param {object} game - The game object
 * @param {string} userId - The user ID
 * @returns {object} The player object
 * @throws {Error} If player is not in the game
 */
function getGamePlayerOrError(game, userId) {
  const player = getGamePlayer(game, userId);
  if (!player) {
    throw new GameErrors.UserNotInGame({ gameCode: game.code, userId });
  }
  return player;
}

/**
 * Checks if a user is a player in the game.
 * @param {object} game - The game object
 * @param {string} userId - The user ID
 * @returns {boolean}
 */
function isPlayerInGame(game, userId) {
  return !!getGamePlayer(game, userId);
}

/**
 * Gets the index of a player in the player list by user ID.
 * @param {Array} playerList - List of player objects
 * @param {string} userId - The user ID
 * @returns {number} The index or -1 if not found
 */
function getPlayerIndex(playerList, userId) {
  return playerList.findIndex((player) => player.userId === userId);
}

/**
 * Gets the index of a player in the game by user ID or throws if not found.
 * @param {object} game - The game object
 * @param {string} userId - The user ID
 * @returns {number} The player index
 * @throws {Error} If player is not in the game
 */
function getPlayerIndexOrError(game, userId) {
  const playerIndex = getPlayerIndex(game.playerList, userId);
  if (playerIndex === -1) {
    throw new GameErrors.UserNotInGame({ gameCode: game.code, userId });
  }
  return playerIndex;
}

/**
 * Transforms the game object to show only the current player's hand and bus cards.
 * @param {object} game - The game object
 * @param {string} userId - The user ID
 */
function transformCurrentPlayerData(game, userId) {
  for (let player of game.playerList) {
    const isCurrentUser = player.userId === userId;
    player.myself = isCurrentUser;
    player.handLength = player.hand?.filter(
      (card) => card && typeof card === "object" && "i" in card,
    ).length;
    if (!isCurrentUser) {
      delete player.hand;
    }

    if (player.bus?.length) {
      const busLength = player.bus.length;
      const firstCard = player.bus[0];
      const lastCard =
        player.checkedBottomBusCard > 2 ? null : player.bus[busLength - 1];

      if (isCurrentUser) {
        player.bus = Array.from({ length: busLength }, (_, i) =>
          i === 0 ? firstCard : i === busLength - 1 ? lastCard : null,
        );
      } else {
        player.bus = [firstCard, ...Array(busLength - 1).fill(null)];
      }
    }

    delete player.checkedBottomBusCard;
  }

  if (game.deck?.length) {
    game.deck = game.deck.map((card) => ({ bg: card.bg }));
  }
}

/**
 * Gets a game by ID or code, throws if not found and error is provided.
 * @param {string} id - The game ID
 * @param {string} code - The game code
 * @param {Function} [error] - Error constructor for missing game
 * @returns {Promise<object>} The game object
 * @throws {Error} If game is not found and error is provided
 */
async function getGame(id, code, error) {
  const params = { id, code };
  let game;
  if (id) {
    game = await games.getById(id);
  } else {
    game = await games.getByCode(code);
  }

  if (!game && error) {
    throw new error(params);
  }

  return game;
}

/**
 * Gets a game by ID or code, returns a warning object if not found.
 * @param {object} params - Parameters with id and code
 * @returns {Promise<object>} The game object or warning object
 */
async function getGameWithWarning(params) {
  try {
    return await getGame(params.id, params.code, GameErrors.GameDoesNotExist);
  } catch (e) {
    console.warn(
      `${GameWarnings.GAME_NOT_FOUND.message} : ${JSON.stringify(params)}`,
      e,
    );
    return { params, warning: GameWarnings.GAME_NOT_FOUND };
  }
}

/**
 * Closes a game and updates its state in the database.
 * @param {object} game - The game object
 * @returns {Promise<object>} The updated game object
 * @throws {Error} If update fails
 */
async function closeGame(game) {
  try {
    return await games.update(game.id, {
      code: `${game.code}-#closed#`,
      state: States.CLOSED,
      sys: game.sys,
    });
  } catch (e) {
    console.error("Failed to close game:", e);
    throw new GameErrors.UpdateGameFailed(game);
  }
}
/**
 * Removes a player from the game and optionally shuffles their cards back into the deck.
 * @param {object} game - The game object
 * @param {number} playerIndex - Index of the player to remove
 * @returns {{newPlayers: object, newDeck: object|undefined}}
 */
function removePlayer(game, playerIndex) {
  let newPlayers;
  let newDeck;

  const copiedGame = structuredClone(game);
  const player = copiedGame.playerList[playerIndex];
  const isPlayerCreator = player.creator;
  if (game.state === States.ACTIVE) {
    newDeck = {
      deck: shuffleDeck([
        ...game.deck,
        ...player?.hand,
        ...player?.busStop?.[0],
        ...player?.busStop?.[1],
        ...player?.busStop?.[2],
        ...player?.busStop?.[3],
        ...player?.bus,
      ]),
    };
  }
  copiedGame.playerList.splice(playerIndex, 1);
  newPlayers = {
    playerList: [...copiedGame.playerList],
  };
  if (isPlayerCreator) {
    newPlayers.playerList[0].creator = true;
  }
  return { newPlayers, newDeck };
}

async function getPlayersNotFinishedGame(userId) {
  const activeGameWithUser = await games.findNotClosedGameByUserId(userId);
  if (activeGameWithUser) {
    transformCurrentPlayerData(activeGameWithUser, userId);
    return { ...activeGameWithUser };
  }
}

function calculateLevel(xp) {
  let level = 1;
  let nextLevelXp = 100;
  while (xp >= nextLevelXp) {
    level++;
    nextLevelXp += level * 100;
  }
  return level;
}

module.exports = {
  transformCurrentPlayerData,
  getGame,
  closeGame,
  getPlayerIndex,
  getPlayerIndexOrError,
  getGamePlayer,
  getGamePlayerOrError,
  isPlayerInGame,
  getGameWithWarning,
  initializeAndDealDeck,
  removePlayer,
  getPlayersNotFinishedGame,
  calculateLevel
};
