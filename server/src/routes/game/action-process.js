const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {processAction: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const GameErrors = require("../../errors/game/game-errors");
const GameBoardValidation = require("../../services/gameboard-validation");
const {rankCardOrder} = require("../../utils/game-constants");
const {shuffleDeck, getCardIndex} = require("../../services/card-service");
const {transformCurrentPlayerData} = require("../../services/game-service");
const InvalidDataError = require("../../errors/invalid-data");
const games = new GamesRepository();
const users = new UsersRepository();

const maxAttempts = 5;

class ProcessAction extends PostResponseHandler {
    constructor(expressApp) {
        console.log("ProcessAction constructor", Routes.Game.ACTION_PROCESS);
        super(expressApp, Routes.Game.ACTION_PROCESS, "processAction");
    }

    async processAction(req) {
        const validData = validateData(req.body, schema);
        const {gameId, gameCode} = validData;
        const userId = req.user.id;

        const user = await users.getUserById(userId);
        if (!user) {
            throw new GameErrors.UserDoesNotExist(user);
        }
        let game;
        if (gameId) {
            game = await games.getGameById(gameId);
        } else if (gameCode) {
            game = await games.getGameByCode(gameCode);
        }

        if (!game) {
            throw new GameErrors.GameDoesNotExist(gameCode || gameId);
        }
        const myself = game.playerList.find(player => player.userId === userId);
        if (!myself) {
            throw new GameErrors.UserNotInGame({userId, gameId: game.id});
        }

        let updatedGame = this.#prepareGameData(game, userId, validData);

        //Checks if the deck of the game is lower than 10 -> gets completedCardList shuffle and deck = [...completedCardList, ...deck]
        updatedGame = this.#checkAndUpdateDeck(updatedGame);

        try {
            let newGame = await games.updateGame(game.id, updatedGame);
            transformCurrentPlayerData(newGame, userId);
            return {newGame, success: true};
        } catch (error) {
            throw new GameErrors.FailedToUpdateGame(error);
        }

    }

    #removeCardFrom(source, card) {
        const index = getCardIndex(card, source, GameErrors.CardDoesNotExist);
        source.splice(index, 1);
    };

    #addCardTo(target, card) {
        target.push(card);
    };

    #prepareGameData(game, userId, params) {
        const newGame = structuredClone(game);
        const {action, card, targetIndex, hand} = params;
        const myself = newGame.playerList.find(player => player.userId === userId);

        const actionHandlers = {
            [GameActions.MOVE_CARD_TO_BUS]: () => {
                this.#removeCardFrom(myself.hand, card);
                this.#addCardTo(myself.bus, card);
                //next round
                newGame.currentPlayer = (newGame.currentPlayer + 1) % newGame.playerList.length;
            },

            [GameActions.MOVE_CARD_TO_BUS_STOP]: () => {
                this.#validationOfBusStop(myself, targetIndex, card);
                this.#removeCardFrom(myself.hand, card);
                this.#addCardTo(myself.busStop[targetIndex], card);
                // next round
                newGame.currentPlayer = (newGame.currentPlayer + 1) % newGame.playerList.length;
            },

            [GameActions.START_NEW_PACK]: () => {
                GameBoardValidation.validationOfNewDestination(card);
                newGame.gameBoard.push([card]);
                this.#removeCardFrom(myself.hand, card);
            },
            [GameActions.START_NEW_PACK_FROM_BUS]: () => {
                GameBoardValidation.validationOfNewDestination(card);
                newGame.gameBoard.push([card]);
                this.#removeCardFrom(myself.bus, card);
            },
            [GameActions.MOVE_CARD_TO_BOARD]: () => {
                GameBoardValidation.validationOfGameBoard(newGame, targetIndex, card);
                this.#removeCardFrom(myself.hand, card);
                this.#addCardTo(newGame.gameBoard[targetIndex], card);

                //if the destination is full, move cards to completedCardList
                if (game.gameBoard[targetIndex].length === rankCardOrder.length) {
                    game.completedCardList = [...game.completedCardList, ...game.gameBoard[params.targetIndex]];
                    game.gameBoard.splice(targetIndex, 1);
                }
            },

            [GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP]: () => {
                GameBoardValidation.validationOfGameBoard(newGame, targetIndex, card);
                this.#removeCardFrom(myself.busStop, card);
                this.#addCardTo(newGame.gameBoard[targetIndex], card);
            },

            [GameActions.MOVE_CARD_TO_BOARD_FROM_BUS]: () => {
                GameBoardValidation.validationOfGameBoard(newGame, targetIndex, card);
                this.#removeCardFrom(myself.bus, card);
                this.#addCardTo(newGame.gameBoard[targetIndex], card);
            },

            [GameActions.DRAW_CARD]: () => {
                if (myself.hand.length < 5) {
                    const newCard = newGame.deck.pop();
                    this.#addCardTo(myself.hand, newCard);
                    this.#removeCardFrom(newGame.deck, newCard);
                }
            },
            [GameActions.REORDER_HAND]: () => {
                this.#validationReorderHands(myself.hand, hand);
                myself.hand = hand;
            },
        };

        if (!actionHandlers[action]) {
            throw new GameErrors.ActionIsNotDefined({action});
        }

        actionHandlers[action]();

        return newGame;
    }

    #checkAndUpdateDeck(game) {
        if (game?.deck?.length < 6) {
            if (game.completedCardList.length === 0) {
                let unusingCards = [];
                for (let destination of game.gameBoard) {
                    let cardList = destination.slice(1);
                    destination = [destination[0]];
                    unusingCards.push(...cardList);
                }
                unusingCards = shuffleDeck(unusingCards);
                game.deck = [...unusingCards, ...game.deck]; //FIXME podívej se jak se líže a zamysli se
            } else {
                const completedCardList = shuffleDeck(game.completedCardList);
                game.deck = [...completedCardList, ...game.deck]; //FIXME podívej se jak se líže a zamysli se
                game.completedCardList = [];
            }
        }
        return game;
    }

    #validationReorderHands(myselfHand, newHand) {
        if (!newHand) { //TODO přestat to validovat tady,,ale vymyslet to přímo ve validačním schematu - nebo by to mělo být na začátku podle mě no..nevim
            throw new InvalidDataError("hand parameter is required for reordering hands");
        }
        if (myselfHand.length === newHand.length) {
            for (let card of myselfHand) {
                const index = newHand.findIndex(c => c.i === card.i);
                if (index === -1) {
                    throw new GameErrors.InvalidHandReorder({myselfHand, newHand});
                }
            }
        } else {
            throw new GameErrors.InvalidHandReorder({myselfHand, newHand});
        }
    }

    #validationOfBusStop(myself, busStopIndex, card) {
        if (busStopIndex > 3) {
            throw new GameErrors.InvalidBusStopIndex({busStopIndex});
        }
        if (myself.busStop?.[busStopIndex].length > 0 && myself.busStop?.[busStopIndex]?.[0].rank !== card.rank) {
            throw new GameErrors.InvalidCardInBusStop({busStopIndex, card});
        }
    }


}


module.exports = ProcessAction;
