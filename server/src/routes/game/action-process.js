const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const validateData = require("../../services/validation-service");
const {processAction: schema} = require("../../data-validations/game/validation-schemas");
const {PostResponseHandler} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const GameErrors = require("../../errors/game/game-errors");
const GameBoardValidation = require("../../services/gameboard-validation");
const {RANK_CARD_ORDER, joker, States} = require("../../utils/game-constants");
const {shuffleDeck, getCardIndex} = require("../../services/card-service");
const {transformCurrentPlayerData} = require("../../services/game-service");
const games = new GamesRepository();
const users = new UsersRepository();

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
        if (game.state !== States.ACTIVE) {
            throw new GameErrors.GameIsNotActive(gameId);
        }

        const myselfIndex = game.playerList.findIndex((c) => c.userId === userId);
        if (myselfIndex === -1) {
            throw new GameErrors.UserNotInGame({userId, gameId: game.id});
        }
        //Can play only current player
        if (game.currentPlayer !== myselfIndex) {
            if (validData.action !== GameActions.REORDER_HAND) {
                throw new GameErrors.UserIsNotCurrentPlayer({myselfIndex, currentPlayer: game.currentPlayer});
            }
        }

        let [updatedGame, xp] = this.#prepareGameData(game, userId, validData);

        //Checks if the deck of the game is lower than 10 -> gets completedCardList shuffle and deck = [...completedCardList, ...deck]
        updatedGame = this.#checkAndUpdateDeck(updatedGame);

        try {
            let newGame = await games.updateGame(game.id, updatedGame);
            transformCurrentPlayerData(newGame, userId);
            if (xp) {
                xp = await users.addUserXP(userId, 100);
                return {xp, newGame, success: true};
            } else {
                return {newGame, success: true};
            }
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
        let xp;
        const myself = newGame.playerList.find(player => player.userId === userId);
        if (myself.isCardDrawed || action === GameActions.REORDER_HAND || action === GameActions.DRAW_CARD) {
            const actionHandlers = {
                [GameActions.MOVE_CARD_TO_BUS]: () => {
                    this.#removeCardFrom(myself.hand, card);
                    this.#addCardTo(myself.bus, card);
                    myself.isCardDrawed = false;
                    //next round
                    newGame.currentPlayer = (newGame.currentPlayer + 1) % newGame.playerList.length;
                },

                [GameActions.MOVE_CARD_TO_BUS_STOP]: () => {
                    this.#validationOfBusStop(myself, targetIndex, card);
                    this.#removeCardFrom(myself.hand, card);
                    this.#addCardTo(myself.busStop[targetIndex], card);
                    myself.isCardDrawed = false;
                    // next round
                    newGame.currentPlayer = (newGame.currentPlayer + 1) % newGame.playerList.length;
                },

                [GameActions.START_NEW_PACK]: () => {
                    GameBoardValidation.validationOfNewDestination(card);
                    newGame.gameBoard.push([card]);
                    this.#removeCardFrom(myself.hand, card);
                    this.#setPlayerToDraw(myself);
                }, [GameActions.START_NEW_PACK_FROM_BUS]: () => {
                    GameBoardValidation.validationOfNewDestination(card);
                    newGame.gameBoard.push([card]);
                    this.#removeCardFrom(myself.bus, card);
                }, [GameActions.MOVE_CARD_TO_BOARD]: () => {
                    GameBoardValidation.validationOfGameBoard(newGame, targetIndex, card);
                    this.#removeCardFrom(myself.hand, card);
                    this.#setPlayerToDraw(myself);
                    this.#addCardTo(newGame.gameBoard[targetIndex], card);

                    //if the destination is full, move cards to completedCardList
                    if (newGame.gameBoard[targetIndex].length === RANK_CARD_ORDER.length) {
                        newGame.completedCardList = newGame.completedCardList || [];
                        newGame.completedCardList = [...newGame.completedCardList, ...newGame.gameBoard[params.targetIndex]];
                        newGame.gameBoard.splice(targetIndex, 1);
                    }
                },

                [GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP]: () => {
                    GameBoardValidation.validationOfGameBoard(newGame, targetIndex, card);
                    this.#removeCardFrom(myself.busStop[targetIndex], card);
                    this.#addCardTo(newGame.gameBoard[targetIndex], card);
                },

                [GameActions.MOVE_CARD_TO_BOARD_FROM_BUS]: () => {
                    GameBoardValidation.validationOfGameBoard(newGame, targetIndex, card);
                    this.#removeCardFrom(myself.bus, card);
                    this.#addCardTo(newGame.gameBoard[targetIndex], card);
                    if (myself.bus.length === 0) {
                        newGame.state = States.CLOSED;
                        newGame.winner = myself.userId;
                        xp = 100;
                        //TODO možná uvažovat nad tim ,že to ostatní ještě můžou dohrát - takže vymyslet procentuální expení na základě pořadí výhry
                    }
                },

                [GameActions.DRAW_CARD]: () => {
                    this.#validateForDraw(myself, newGame.playerList, newGame.currentPlayer);
                    const newCard = newGame.deck.pop();
                    this.#addCardTo(myself.hand, newCard);
                    if (myself.hand.length === 5) {
                        myself.isCardDrawed = true;
                    }
                }, [GameActions.REORDER_HAND]: () => {
                    this.#validationReorderHands(myself.hand, hand);
                    myself.hand = hand;
                },
            };

            if (!actionHandlers[action]) {
                throw new GameErrors.ActionIsNotDefined({action});
            }

            actionHandlers[action]();
            return [newGame, xp];
        } else {
            throw new GameErrors.PlayerMustDrawCardFirst({isCardDrawed: myself.isCardDrawed});
        }

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

    #validateForDraw(myself) {
        if (myself.hand.length >= 5) {
            throw new GameErrors.InvalidHandLength({hand: myself.hand});
        }
        if (myself?.isCardDrawed === true && myself.hand.length > 0) {
            throw new GameErrors.NotPossibleToDraw({
                hand: myself.hand, isCardDrawed: myself.isCardDrawed, countCard: myself.hand.length
            });

        }
    }

    #validationOfBusStop(myself, busStopIndex, card) {
        if (busStopIndex > 3) {
            throw new GameErrors.InvalidBusStopIndex({busStopIndex});
        }
        if (card.rank === joker || card.rank === RANK_CARD_ORDER[0]) {
            throw new GameErrors.InvalidCardInBusStop({card});
        }
        if (myself.busStop?.[busStopIndex].length > 0 && myself.busStop?.[busStopIndex]?.[0].rank !== card.rank) {
            throw new GameErrors.InvalidCardInBusStop({busStopIndex, card});
        }
    }

    #setPlayerToDraw(myself) {
        if (myself.hand.length === 0) {
            myself.isCardDrawed = false;
        }
    }


}


module.exports = ProcessAction;
