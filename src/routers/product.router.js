const Router = require("koa-joi-router"); 
const { product } = require("../controllers");
const authMiddleware = require("../middleware/auth.middleware");
 
const { validateSchema } = require('../commons/validate')  
const path = require('path'); 
const filename = path.basename(__filename).split('.')[0]; 
const directory = `../../docs/schemas/${filename}/Request/` 
 
const api = Router();
api.prefix("/product"); 
 
api.route({  
  method: "GET",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/",
  handler: product.getProducts,
});

api.route({  
  method: "POST",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/",
  validate:  validateSchema(directory+'create.json'),
  handler: product.createProduct,
});

api.route({  
  method: "PUT",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/",
  validate:  validateSchema(directory+'update.json'),
  handler: product.updateProduct,
});
 
api.route({ 
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  method: "GET", 
  path: "/:product_id",
  handler: product.getProductById,
});
 
api.route({ 
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  method: "DELETE", 
  path: "/:product_id",
  handler: product.deleteProduct,
});
 
module.exports = api;
