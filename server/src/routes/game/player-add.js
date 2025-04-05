const express = require("express");
const {body, check} = require("express-validator");
const {getUserById} = require("../../models/users-repository");
const GamesRepository = require("../../models/games-repository");
const games = new GamesRepository();
const addGamePlayer = express.Router();

addGamePlayer.post("/game/player/add", [
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
//TODO if the game is in active state ends
        let game;

        if (gameId) {
            game = await games.getGameById(gameId);
        } else {
            game = await games.getGameByCode(gameCode);
        }

        if (!game) {
            return res.status(404).json({success: false, message: "The game does not exist"});
        }

        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({success: false, error: "User not found"});
        }

        //validation of players
        const isPlayerInGame = game.players.find((player) =>
            player.userId === userId
        );
        if (isPlayerInGame) {
            return res.status(400).json({success: false, message: "Player is already in game"});
        }

        const newPlayers = {
            players: [...game.players, {userId, name: user.name, creator: false}],
        };
        try {
            const updatedGame = await games.updateGame(game.id, newPlayers);
            return res.json({...updatedGame, success: true});

        } catch (error) {
            res.status(500).json({error: "Failed to add player", success: false});
        }
    })

module.exports = addGamePlayer;
