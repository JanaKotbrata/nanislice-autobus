const express = require("express");
const {body, check} = require("express-validator");
const GamesRepository = require("../../models/games-repository");
const games = new GamesRepository();

const removeGamePlayer = express.Router();

function removePlayer(game, userId) {
    let newPlayers;
    const copiedGame = JSON.parse(JSON.stringify(game));
    const userToRemove = copiedGame.players.findIndex(player => player.userId === userId);
    if (userToRemove !== -1) {
        const isPlayerCreator = copiedGame.players[userToRemove].creator;
        copiedGame.players.splice(userToRemove, 1);
        newPlayers = {
            players: [...copiedGame.players],
        }
        if (isPlayerCreator) {
            newPlayers.players[0].creator = true;
        }
    }
    return newPlayers;
}

removeGamePlayer.post("/game/player/remove", [
        body("gameId").optional().custom((value, {req}) => {
            if (!value && !req.body.code) {
                throw new Error("Either 'gameCode' or 'gameId' is required");
            }
            return true;
        }),
        check("gameCode")
            .optional()
            .custom((value, {req}) => {
                if (!value && !req.body.id) {
                    throw new Error("Either 'gameCode' or 'gameId' is required");
                }
                return true;
            }),
        body("userId").isString().notEmpty().withMessage("userId is required"),
    ],
    async (req, res) => {
        const {userId, gameCode, gameId} = req.body;

        let game;

        if (gameId) {
            game = await games.getGameById(gameId);
        } else {
            game = await games.getGameByCode(gameCode);
        }

        if (!game) {
            return res.status(404).json({success: false, message: "The game does not exist"});
        }
        let isPlayerInGame = game.players.find((player) =>
            player.userId === userId
        );
        if (!isPlayerInGame) {
            return res.status(400).json({success: false, message: "Player is not in game"});
        }

        //validation of players
        const isPossibleToRemove = !!(game.players.length > 1);

        if (isPossibleToRemove) {
            const newPlayers = removePlayer(game, userId);
            if(newPlayers) {
                try {
                    const updatedGame = await games.updateGame(game.id, newPlayers);
                    return res.json({...updatedGame, success: true});

                } catch (error) {
                    res.status(500).json({error: "Failed to remove player", success: false});
                }
            }
        } else {
            //await games.deleteGame(game.id); //TODO na základě ještě nějaké podmínky
            const newGame = await games.updateGame(game.id, {code: `${game.code}-#closed#`, status: "closed"});
            return res.json({...newGame, success: true});
        }

    })

module.exports = removeGamePlayer;
