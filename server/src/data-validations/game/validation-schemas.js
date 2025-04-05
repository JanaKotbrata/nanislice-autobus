const Joi = require('joi');
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
    userId: id.required(),
});
const close = Joi.object().keys({gameCode: code.required()});
const gDelete = Joi.object().keys({
    id,
    code
}).or("id", "code");
const playerAdd = Joi.object().keys({gameId: id, gameCode: code, userId: id}).or("gameId", "gameCode");
const playerRemove = Joi.object().keys({gameId: id, gameCode: code, userId: id}).or("gameId", "gameCode");
const startGame = Joi.object().keys({gameId: id, gameCode: code}).or("gameId", "gameCode");

module.exports = {get, list, create, close, gDelete, playerAdd, playerRemove, startGame};