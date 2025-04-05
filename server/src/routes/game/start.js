const express = require("express");
const {body, check} = require("express-validator");

const GamesRepository = require("../../models/games-repository");
const games = new GamesRepository();

const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
];
const suits = ["♥", "♦", "♠", "♣"];
const cardOrder = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
];

function dealCards(deck, cardNumber) {
    const newDeck = [...deck];
    const pack = newDeck.splice(-cardNumber);
    return [newDeck, pack]
}

function dealCardPerPlayer(deck, playerList) {
    let cacheDeck = [...deck];
    let game = [];
    for (let player of playerList) {
        //deal hand
        let [newDeck, hand] = dealCards(cacheDeck, 5);
        //deal bus
        let [finalDeck, bus] = dealCards(newDeck, 10);
        cacheDeck = finalDeck;
        game.push({...player, hand, bus});
    }
    return [cacheDeck, game];
}

function getCardDeck(i = 0) {
    const pack = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            pack.push({i, rank, suit});
            i++;
        }
    }
    pack.push({i: i + 1, rank: "Jr", suit: "🃏"});
    pack.push({i: i + 2, rank: "Jr", suit: "🃏"});
    return pack;
}

function shuffleDeck(deck) {
    let shuffledDeck = [...deck];
    for (let i = deck.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temp = shuffledDeck[i];
        shuffledDeck[i] = shuffledDeck[randomIndex];
        shuffledDeck[randomIndex] = temp;
    }
    return shuffledDeck;
}

function initDeck(gamePlayers) {
    let gamePack = getCardDeck();
    const lastIndex = gamePack[gamePack.length - 1].i;
    let deck = gamePack.concat(getCardDeck(lastIndex));
    let multiplier = 1;
    const basePlayers = 5;

    // Dynamické násobení balíčku
    while (gamePlayers.length > basePlayers * multiplier) {
        const lastIndex = deck[deck.length - 1].i;
        deck = deck.concat(getCardDeck(lastIndex));
        multiplier *= 2;
    }
    return shuffleDeck(deck);
}

const startGame = express.Router();
startGame.post("/game/start", [
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
        })
], async (req, res) => {
    const {gameCode, gameId} = req.body;
    let game;

    if (gameId) {
        game = await games.getGameById(gameId);
    } else {
        game = await games.getGameByCode(gameCode);
    } //TODO if the game is in active state ends
    if (!game) {
        return res.status(404).json({success: false, message: "The game does not exist"});
    }

    const fullDeck = initDeck(game.players);
    const [deck, playerList] = dealCardPerPlayer(fullDeck, game.players);
    let newGame = {...game, status: "active", deck, playerList}
    delete newGame.sys;
    try {
        const startedGame = await games.updateGame(game.id, newGame);
        return res.status(200).json({...startedGame, success: true});
    } catch (e) {
        return res.status(500).json({success: false, message: e});
    }

});

module.exports = startGame;
