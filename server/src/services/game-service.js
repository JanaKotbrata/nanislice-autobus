const GamesRepository = require("../models/games-repository");
const GameErrors = require("../errors/game/game-errors");
const GameWarnings = require("../errors/game/game-warnings");
const games = new GamesRepository();

function transformCurrentPlayerData(game, userId) {
    for (let player of game.playerList) {
        const isCurrentUser = player.userId === userId;
        player.myself = isCurrentUser;

        if (!isCurrentUser) {
            delete player.hand;
        }

        if (player.bus?.length) {
            const busLength = player.bus.length;
            const firstCard = player.bus[0];
            const lastCard = player.bus[busLength - 1];

            if (isCurrentUser) {
                player.bus = Array.from({length: busLength}, (_, i) =>
                    i === 0 ? firstCard :
                        i === busLength - 1 ? lastCard :
                            null
                );
            } else {
                player.bus = [firstCard, ...Array(busLength - 1).fill(null)];
            }
        }
    }

    if (game.deck?.length) {
        game.deck = Array(game.deck.length).fill(null);
    }
}

async function getGame(id, code, error, warning) {
    const params = {id, code}
    let game;
    if (id) {
        game = await games.getGameById(id);
    } else {
        game = await games.getGameByCode(code);
    }

    if (!game && error) {
        throw new GameErrors.GameDoesNotExist(params);
        // TODO return new GameErrors.GameDoesNotExist(validData); //Použití jako warning - ale je lepší udělat novou třídu pro Warning
    }
    if (!game && warning) {
        console.warn(`${GameWarnings.GAME_NOT_FOUND.message} : ${JSON.stringify(params)}`);
        return {params, warning: GameWarnings.GAME_NOT_FOUND};
    }
    return game;
}

async function closeGame(game) {
    try {
        return await games.updateGame(game.id, {code: `${game.code}-#closed#`, state: "closed", sys: game.sys});
    } catch (e) {
        console.error("Failed to close game:", e);
        throw new GameErrors.UpdateGameFailed(game);
    }
}

module.exports = {transformCurrentPlayerData, getGame, closeGame};