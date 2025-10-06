const Joi = require("joi");
const role = Joi.string().valid("pleb", "vip", "admin").optional();
const id = Joi.string().length(24).alphanum();
const list = Joi.object().keys({
  role,
  pageInfo: Joi.object().keys({
    pageIndex: Joi.number().integer().min(0).default(0),
    pageSize: Joi.number().integer().min(1).default(1000),
  }),
});
const deleteUser = Joi.object().keys({
  userId: id.required(),
});
const tDelete = Joi.object().keys({});
const getAvatar = Joi.object().keys({
  userId: id.required(),
  cacheBreaker: Joi.string().optional(),
});
const update = Joi.object()
  .keys({
    userId: id,
    name: Joi.string().min(1).max(100).optional(),
    language: Joi.string().valid("cs", "sk", "en", "null").optional(),
    picture: Joi.string().optional(),
    volume: Joi.number().optional(),
    cardStyle: Joi.string().optional(),
    gameboardColor: Joi.string().optional(),
  })
  .or("name", "picture", "language", "volume", "cardStyle", "gameboardColor");
module.exports = { list, update, deleteUser, getAvatar, tDelete };
