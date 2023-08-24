const Router = require('koa-joi-router')
const Joi = Router.Joi

const getPagination = (page, size) => {
    const limit = parseInt(size, 10) || 10;
    const offset = (parseInt(page, 10) - 1) * limit || 0;

    return { limit, offset };
}

module.exports = {
    getPagination,
}