const express = require("express");
const {generateGameCode} = require("../../utils/helpers");
const {getUserById} = require("../../models/users-repository");
const GamesRepository = require("../../models/games-repository");
const games = new GamesRepository();

const createGame = express.Router();
const maxAttempts = 5;
createGame.post("/game/create", async (req, res) => {
    const {userId} = req.body;
    let isDuplicateKey = false;
    let tryCount = 0;

    // validation
    if (!userId) {
        return res.status(400).json({success: false, error: "userId is required"});
    }
    // generates game code
    // TODO list active games with players- if is this player in some active game - it should throw error
    const user = await getUserById(userId);
    if (!user) {
        return res.status(404).json({success: false, error: "User not found"});
    }
    do {
        const gameCode = generateGameCode();

        // creates new game
        const newGame = {
            code: gameCode,
            status: "initial",
            players: [{userId, name:user.name, creator: true}],
        };
        try {
            const game = await games.createGame(newGame);
            return res.json({...game, success: true});

        } catch (error) {
            if (error.code !== 11000) {
                console.error("Error creating game:", error);
                return res.status(500).json({error: "Internal server error", success: false});
            } else {
                isDuplicateKey = true;
                tryCount++;
                console.log(`Trying execute again for ${tryCount}th time. Error: `, error);
            }
            if (tryCount >= maxAttempts) {
                return res.status(400).json({
                    error: "Maximum attempts reached. Unable to create game.",
                    success: false,
                });
            }
        }
    } while (isDuplicateKey && tryCount < maxAttempts);
});

module.exports = createGame;
