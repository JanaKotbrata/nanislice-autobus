const GamesRepository = require("../../models/games-repository");
const validateData = require("../../services/validation-service");
const {startGame: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes");
const GameErrors = require("../../errors/game/game-errors");
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

class StartGame extends PostResponseHandler {
    constructor(expressApp) {
        super(expressApp, Routes.Games.START, "start");
    }

    async start(req) {
        const validData = validateData(req.body, schema); //TODO chyba v players vs playerList - ted je to v db redundantní
        const {gameCode, gameId} = validData;
        let game;

        if (gameId) {
            game = await games.getGameById(gameId);
        } else {
            game = await games.getGameByCode(gameCode);
        } //TODO if the game is in active state ends
        if (!game) {
            throw new GameErrors.GameDoesNotExistError(validData);
        }

        const fullDeck = this.#initDeck(game.playerList);
        const [deck, playerList] = this.#dealCardPerPlayer(fullDeck, game.playerList);
        let newGame = {...game, status: "active", deck, playerList}
        delete newGame.sys;
        try {
            const startedGame = await games.updateGame(game.id, newGame);
            return {...startedGame, success: true};
        } catch (e) {
            throw new GameErrors.UpdateGameFailed(validData);
        }
    }

    #dealCards(deck, cardNumber) {
        const newDeck = [...deck];
        const pack = newDeck.splice(-cardNumber);
        return [newDeck, pack]
    }

    #dealCardPerPlayer(deck, playerList) {
        let cacheDeck = [...deck];
        let game = [];
        for (let player of playerList) {
            //deal hand
            let [newDeck, hand] = this.#dealCards(cacheDeck, 5);
            //deal bus
            let [finalDeck, bus] = this.#dealCards(newDeck, 10);
            cacheDeck = finalDeck;
            game.push({...player, hand, bus, busStop: [{}, {}, {}, {}]});
        }
        return [cacheDeck, game];
    }

    #getCardDeck(i = 0) {
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

    #shuffleDeck(deck) {
        let shuffledDeck = [...deck];
        for (let i = deck.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));

            const temp = shuffledDeck[i];
            shuffledDeck[i] = shuffledDeck[randomIndex];
            shuffledDeck[randomIndex] = temp;
        }
        return shuffledDeck;
    }

    #initDeck(gamePlayers) {
        let gamePack = this.#getCardDeck();
        const lastIndex = gamePack[gamePack.length - 1].i;
        let deck = gamePack.concat(this.#getCardDeck(lastIndex));
        let multiplier = 1;
        const basePlayers = 5;

        // Dynamické násobení balíčku
        while (gamePlayers.length > basePlayers * multiplier) {
            const lastIndex = deck[deck.length - 1].i;
            deck = deck.concat(this.#getCardDeck(lastIndex));
            multiplier *= 2;
        }
        return this.#shuffleDeck(deck);
    }
}


module.exports = StartGame;
