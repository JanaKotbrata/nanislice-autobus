const Joi = require("joi");
const role = Joi.string().valid("pleb", "vip", "admin").optional();
const id = Joi.string().length(24).alphanum();
const list = Joi.object().keys({
    role,
    pageInfo: Joi.object().keys({
        pageIndex: Joi.number().integer().min(0).default(0),
        pageSize: Joi.number().integer().min(1).default(1000)
    })
})
const update = Joi.object().keys({
    name: Joi.string().min(1).max(100).optional(),
    picture: Joi.string().optional(),
}).or("name", "picture");
module.exports = {list, update};