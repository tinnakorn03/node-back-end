const Router = require("koa-joi-router"); 
const { createOrder, getOrderByTransactionNo, getOrders, deleteOrder } = require("../controllers/orders.controller");
const authMiddleware = require("../middleware/auth.middleware");
 
const { validateSchema } = require('../commons/validate');
const path = require('path'); 

const filename = path.basename(__filename).split('.')[0]; 
const directory = `../../docs/schemas/${filename}/Request/`;
 

const api = Router();
api.prefix("/orders"); 


api.route({
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: 'GET',
    path: '/',
    handler: getOrders
}); 

api.route({
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: 'POST',
    path: '/',
    validate:  validateSchema(directory + 'createOrder.json'), 
    handler: createOrder
});

api.route({
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: 'GET',
    path: '/:transactionNo',
    handler: getOrderByTransactionNo
});

api.route({
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: 'DELETE',
    path: '/:transactionNo',
    handler: deleteOrder
});

module.exports = api;
