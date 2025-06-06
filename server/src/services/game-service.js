const GamesRepository = require("../models/games-repository");
const GameErrors = require("../errors/game/game-errors");
const GameWarnings = require("../errors/game/game-warnings");
const games = new GamesRepository();

function transformCurrentPlayerData(game, userId) { //TODO vrátit deck bez dat :))
    for (let player of game.playerList) {
        if (player.userId === userId) {
            player.myself = true;
        } else {
            delete player.hand;
            player.bus = [player.bus[0]];//TODO vrátit počet karet v autobusu aby ostatní věděli jak na tom jsou - vrátim celé pole s null a první "poslední" kartou
        }
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

module.exports = {transformCurrentPlayerData,getGame};