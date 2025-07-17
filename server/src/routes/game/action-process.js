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
const {authorizeUser} = require("../../services/auth-service");
const games = new GamesRepository();
const users = new UsersRepository();

class ProcessAction extends PostResponseHandler {
    constructor(expressApp, io) {
        super(expressApp, Routes.Game.ACTION_PROCESS, "processAction");
        this.io = io;
    }

    async processAction(req) {
        const validData = validateData(req.body, schema);
        const {gameId, gameCode} = validData;
        const userId = req.user.id;

        await authorizeUser(userId, GameErrors.UserDoesNotExist, GameErrors.UserNotAuthorized);

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
            if (xp) {
                xp = await users.addUserXP(userId, 100);
            }
            newGame.playerList.forEach(player => {
                const playerId = player.userId;
                const playerGame = structuredClone(newGame);
                transformCurrentPlayerData(playerGame, playerId);
                console.log(`Emitting processAction event to ${gameCode}_${playerId}`);
                this.io.to(`${gameCode}_${playerId}`).emit("processAction", {
                    userId, newGame:playerGame, xp
                });
            })
            transformCurrentPlayerData(newGame, userId);
            return {xp, newGame, success: true};
        } catch (error) {
            throw new GameErrors.FailedToUpdateGame(error);
        }

    }


    #removeCardFrom(source, card) {
        const index = getCardIndex(card, source, GameErrors.CardDoesNotExist);
        source.splice(index, 1);
    };

    #removeCardFromBusStop(busStop, cardToRemove) {
        let found = false;
        for (let i = 0; i < busStop.length; i++) {
            const originalLength = busStop[i].length;
            busStop[i] = busStop[i].filter(card =>
                !(card.i === cardToRemove.i)
            );
            if (busStop[i].length < originalLength) {
                found = true;
                break;
            }
        }

        if (!found) {
            throw new GameErrors.CardIsMissing(cardToRemove);
        }
    }

    #removeCardFromHand(hand, card) {
        const index = getCardIndex(card, hand, GameErrors.CardDoesNotExist);
        hand[index] = {}; // replace with empty object to keep the same length
    };

    #addCardTo(target, card) {
        target.push(card);
    };

    #drawCard(target, card) {
        const index = target.findIndex((c) => !c.rank);
        target[index] = card;
    };

    #completeCardList(newGame, targetIndex) {
        if (newGame.gameBoard[targetIndex].length === RANK_CARD_ORDER.length) {
            newGame.completedCardList = newGame.completedCardList || [];
            newGame.completedCardList = [...newGame.completedCardList, ...newGame.gameBoard[targetIndex]];
            newGame.gameBoard.splice(targetIndex, 1);
        }
    }

    #prepareGameData(game, userId, params) {
        const newGame = structuredClone(game);
        const {action, card, targetIndex, hand} = params;
        let xp;
        const myself = newGame.playerList.find(player => player.userId === userId);
        if (myself.isCardDrawed || action === GameActions.REORDER_HAND || action === GameActions.DRAW_CARD) {
            const actionHandlers = {
                [GameActions.MOVE_CARD_TO_BUS]: () => {
                    this.#removeCardFromHand(myself.hand, card);
                    this.#addCardTo(myself.bus, card);
                    myself.isCardDrawed = false;
                    //next round
                    newGame.currentPlayer = (newGame.currentPlayer + 1) % newGame.playerList.length;
                },

                [GameActions.MOVE_CARD_TO_BUS_STOP]: () => {
                    this.#validationOfBusStop(myself, targetIndex, card);
                    this.#removeCardFromHand(myself.hand, card);
                    this.#addCardTo(myself.busStop[targetIndex], card);
                    myself.isCardDrawed = false;
                    // next round
                    newGame.currentPlayer = (newGame.currentPlayer + 1) % newGame.playerList.length;
                },

                [GameActions.START_NEW_PACK]: () => {
                    GameBoardValidation.validationOfNewDestination(card);
                    newGame.gameBoard.push([card]);
                    this.#removeCardFromHand(myself.hand, card);
                    this.#setPlayerToDraw(myself);
                }, [GameActions.START_NEW_PACK_FROM_BUS]: () => {
                    GameBoardValidation.validationOfNewDestination(card);
                    newGame.gameBoard.push([card]);
                    this.#removeCardFrom(myself.bus, card);
                    if (myself.bus.length === 0) {
                        newGame.state = States.FINISHED;
                        newGame.winner = myself.userId;
                        xp = 100;
                        //TODO možná uvažovat nad tim ,že to ostatní ještě můžou dohrát - takže vymyslet procentuální expení na základě pořadí výhry
                    }
                }, [GameActions.MOVE_CARD_TO_BOARD]: () => {
                    GameBoardValidation.validationOfGameBoard(newGame, targetIndex, card);
                    this.#removeCardFromHand(myself.hand, card);
                    this.#addCardTo(newGame.gameBoard[targetIndex], card);
                    this.#setPlayerToDraw(myself);
                    //if the destination is full, move cards to completedCardList
                    this.#completeCardList(newGame, targetIndex);
                },

                [GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP]: () => {
                    GameBoardValidation.validationOfGameBoard(newGame, targetIndex, card);
                    this.#removeCardFromBusStop(myself.busStop, card);
                    this.#addCardTo(newGame.gameBoard[targetIndex], card);
                    //if the destination is full, move cards to completedCardList
                    this.#completeCardList(newGame, targetIndex);
                },

                [GameActions.MOVE_CARD_TO_BOARD_FROM_BUS]: () => {
                    GameBoardValidation.validationOfGameBoard(newGame, targetIndex, card);
                    this.#removeCardFrom(myself.bus, card);
                    this.#addCardTo(newGame.gameBoard[targetIndex], card);
                    //if the destination is full, move cards to completedCardList
                    this.#completeCardList(newGame, targetIndex);
                    if (myself.bus.length === 0) {
                        newGame.state = States.FINISHED;
                        newGame.winner = myself.userId;
                        xp = 100;
                        //TODO možná uvažovat nad tim ,že to ostatní ještě můžou dohrát - takže vymyslet procentuální expení na základě pořadí výhry
                    }
                },

                [GameActions.DRAW_CARD]: () => {
                    const actualCardsInHand = myself.hand.filter(card => card.rank !== undefined && card.rank !== null);
                    this.#validateForDraw(myself, actualCardsInHand);
                    const newCard = newGame.deck.pop();
                    this.#drawCard(myself.hand, newCard);
                    if ((actualCardsInHand.length + 1) === 5) {
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
                let unusedCards = [];
                for (let destination of game.gameBoard) {
                    let cardList = destination.slice(1);
                    destination = [destination[0]];
                    unusedCards.push(...cardList);
                }
                unusedCards = shuffleDeck(unusedCards);
                game.deck = [...unusedCards, ...game.deck];
                const completedCardList = shuffleDeck(game.completedCardList);
                game.deck = [...completedCardList, ...game.deck];
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

    #validateForDraw(myself, actualCardsInHand) {
        if (actualCardsInHand.length >= 5) {
            throw new GameErrors.InvalidHandLength({hand: myself.hand});
        }
        if (myself?.isCardDrawed === true && actualCardsInHand.length > 0) {
            throw new GameErrors.NotPossibleToDraw({
                hand: myself.hand, isCardDrawed: myself.isCardDrawed, countCard: myself.hand.length
            });

        }
    }

    #validationOfBusStop(myself, busStopIndex, card) {
        const existingIndexWithSameRank = myself.busStop?.findIndex(
            (stack) => stack.length > 0 && stack[0].rank === card.rank
        );
        if (
            existingIndexWithSameRank !== -1 &&
            existingIndexWithSameRank !== busStopIndex
        ) {
            throw new GameErrors.InvalidCardInBusStopDifferentIndex({
                attemptedIndex: busStopIndex,
                expectedIndex: existingIndexWithSameRank,
                card,
            });
        }
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
        const hand = myself.hand.filter((card) => Number.isFinite(card?.i));
        if (hand.length === 0) {
            myself.isCardDrawed = false;
        }
    }


}


module.exports = ProcessAction;
