const express = require("express");
const {body, validationResult} = require("express-validator");
const games = require("../../models/games-repository");

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
            await games.updateGame(game._id, {code: `${game.code}-#closed#`, status: "closed"});//To překodovani asi nepotřebuju vzhledem generovaci funkce pro code - 62 různých kódů na šestou - to je hodně kombinací :)
            const updatedGame = await games.getGameById(game._id);
            return res.json({success: true, gameId: updatedGame._id, code: gameCode});
        } catch (e) {
            console.error("Failed to set state of the game:", e);
            return res.status(500).json({success: false, message: "Server error"});
        }
    }
);

module.exports = closeGame;
