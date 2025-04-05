const express = require("express");
const {body, validationResult} = require("express-validator");
const GamesRepository = require("../../models/games-repository");
const games = new GamesRepository();
const listGame = express.Router();

// Endpoint pro uzavření hry
listGame.get(
    "/game/list",
    [
        body("state").optional().isIn(["initial","active", "closed"]).withMessage("State must be either 'active' or 'closed'"),
    ],
    async (req, res) => {
        // validation of input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success: false, errors: errors.array()});
        }
        const {state} = req.body;

        //tries to get the game by code

        if (state) {
            const gameList = await games.listGameByState();
            return res.json({...gameList, success: true});
        } else {
            const gameList = await games.listGame();
            return res.json({...gameList, success: true});
        }

    }
);

module.exports = listGame;
