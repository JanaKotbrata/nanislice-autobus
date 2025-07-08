const Joi = require("joi");
const role = Joi.string().valid("pleb", "vip", "admin").optional();
const list = Joi.object().keys({
    role,
    pageInfo: Joi.object().keys({
        pageIndex: Joi.number().integer().min(0).default(0),
        pageSize: Joi.number().integer().min(1).default(1000)
    })
})
module.exports = {list};