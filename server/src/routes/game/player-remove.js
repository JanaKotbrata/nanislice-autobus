const express = require("express");
const games = require("../../models/games-repository");
const {body, check} = require("express-validator");

const removeGamePlayer = express.Router();

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

        //validation of players
        const isPlayerInGame = game.players.find((player) =>
            player.userId === userId
        );
        if (isPlayerInGame) { //TODO if the user is creator - we should do creator with someone else - if the user is last member of game - the game will be closed
            return res.status(400).json({success: false, message: "Player is already in game"});
        }

        const newPlayers = {
            players: [...game.players, {userId, creator: false}],
        };
        try {
            await games.updateGame(game._id, newPlayers);
            const updatedGame = await games.getGameById(game._id);
            return res.json({...updatedGame, success: true});

        } catch (error) {
            res.status(500).json({error: "Failed to remove player", success: false});
        }
    })

module.exports = removeGamePlayer;
