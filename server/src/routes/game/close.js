const express = require("express");
const {body, validationResult} = require("express-validator");
const GamesRepository = require("../../models/games-repository");
const games = new GamesRepository();
const closeGame = express.Router();

// Endpoint pro uzavření hry
closeGame.post(
    "/game/close",
    [
        body("gameCode").isString().notEmpty().withMessage("gameCode je povinný a musí být řetězec"),
    ],
    async (req, res) => {
        // validation of input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success: false, errors: errors.array()});
        }
        const {gameCode} = req.body;

        //tries to get the game by code

        const game = await games.getGameByCode(gameCode);
        if (!game) {
            return res.status(404).json({success: false, message: "The game does not exist"});
        }

        //updates state of the game if exists
        try {
            const updatedGame = await games.updateGame(game.id, {code: `${game.code}-#closed#`, status: "closed"});
            return res.json({...updatedGame, success: true});
        } catch (e) {
            console.error("Failed to set state of the game:", e);
            return res.status(500).json({success: false, message: "Server error"});
        }
    }
);

module.exports = closeGame;
