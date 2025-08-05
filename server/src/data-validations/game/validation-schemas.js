const Joi = require('joi');
const GameActions = require("../../../../shared/constants/game-actions.json");
const {bool} = require("joi");
const id = Joi.string().length(24).alphanum();
const code = Joi.string().length(6).pattern(/^[a-zA-Z0-9]+$/);
const state = Joi.string().valid("initial", "active", "closed").optional();
const get = Joi.object().keys({
    id,
    code
}).or("id", "code");

const list = Joi.object().keys({
    state,
    pageInfo: Joi.object().keys({
        pageIndex: Joi.number().integer().min(0).default(0),
        pageSize: Joi.number().integer().min(1).default(1000)
    })
})
const create = Joi.object().keys({

});
const close = Joi.object().keys({gameId: id, gameCode: code}).or("gameId", "gameCode");;
const gDelete = Joi.object().keys({
    id,
    code
}).or("id", "code");
const playerAdd = Joi.object().keys({gameId: id, gameCode: code, userId: id}).or("gameId", "gameCode");
const playerSet = Joi.object().keys({gameId: id, gameCode: code, userId: id, ready:Joi.boolean()}).or("gameId", "gameCode");
const playerSetOrder = Joi.object().keys({gameId: id, gameCode: code, userId: id, playerList: Joi.array().required()}).or("gameId", "gameCode");
const playerRemove = Joi.object().keys({gameId: id, gameCode: code, userId: id}).or("gameId", "gameCode");
const startGame = Joi.object().keys({gameId: id, gameCode: code}).or("gameId", "gameCode");
const processAction = Joi.object().keys({
        gameId: id,
        gameCode: code,
        action: Joi.string().required(),
        hand: Joi.when('action', {
            is: GameActions.REORDER_HAND,
            then: Joi.array().required(),
            otherwise: Joi.array().optional()
        }),
        targetIndex: Joi.when('action', {
            is: Joi.valid(GameActions.MOVE_CARD_TO_BOARD,
                GameActions.MOVE_CARD_TO_BUS_STOP,
                GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP,
                GameActions.MOVE_CARD_TO_BOARD_FROM_BUS
            ),
            then: Joi.number().integer().min(0).required(),
        }),
        card: Joi.when('action', {
            is: Joi.valid(GameActions.MOVE_CARD_TO_BOARD,
                GameActions.MOVE_CARD_TO_BUS_STOP,
                GameActions.MOVE_CARD_TO_BUS,
                GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP,
                GameActions.MOVE_CARD_TO_BOARD_FROM_BUS,
                GameActions.START_NEW_PACK,
                GameActions.START_NEW_PACK_FROM_BUS,
            ),
            then: Joi.object().keys({
                i: Joi.number().integer().min(0).required(),
                rank: Joi.string().required(),
                suit: Joi.string().required(),
                bg: Joi.string().optional()
            }).required(),
        }),
    }
).or("gameId", "gameCode");

module.exports = {get, list, create, close, gDelete, playerAdd, playerSet, playerRemove, startGame, processAction, playerSetOrder};