const express = require("express");
const {body, check, validationResult} = require("express-validator");
const GamesRepository = require("../../models/games-repository");
const games = new GamesRepository();

const getGame = express.Router();

// Endpoint pro uzavření hry
getGame.get(
    "/game/get",
    [
        body("id").optional().custom((value, { req }) => {
            if (!value && !req.body.code) {
                throw new Error("Either 'code' or 'id' is required");
            }
            return true;
        }),
        check("code")
            .optional()
            .custom((value, { req }) => {
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


        if (id) {
            const game = await games.getGameById(id);
            return res.json({...game, success: true});
        } else {
            const game = await games.getGameByCode(code);
            return res.json({...game, success: true});
        }

    }
);

module.exports = getGame;
