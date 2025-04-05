const express = require("express");
const {body, check, validationResult} = require("express-validator");
const GamesRepository = require("../../models/games-repository");
const games = new GamesRepository();
const deleteGame = express.Router();

deleteGame.post(
    "/game/delete",
    [
        body("id").optional().custom((value, {req}) => {
            if (!value && !req.body.code) {
                throw new Error("Either 'code' or 'id' is required");
            }
            return true;
        }),
        check("code")
            .optional()
            .custom((value, {req}) => {
                if (!value && !req.body.id) {
                    throw new Error("Either 'code' or 'id' is required");
                }
                return true;
            }),
    ],
    async (req, res) => {
        // validation of input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success: false, errors: errors.array()});
        }
        const {id, code} = req.body;

        let game;

        if (id) {
            game = await games.getGameById(id);
        } else {
            game = await games.getGameByCode(code);
        }

        if (!game) {
            return res.status(404).json({success: false, message: "The game does not exist"});
        }
        try {
            await games.deleteGame(game.id);
            return res.json({id: game.id, success: true});
        } catch (e) {
            console.error("Failed to delete game:", e);
            return res.status(500).json({success: false, message: "Server error"});
        }

    }
);

module.exports = deleteGame;
