const Router = require("koa-joi-router"); 
const { user } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
 
const { validateSchema } = require('../commons/validate')  
const path = require('path'); 
const filename = path.basename(__filename).split('.')[0]; 
const directory = `../../docs/schemas/${filename}/Request/` 
 
const api = Router();
api.prefix("/user"); 
 
api.route({ 
  method: "POST",
  path: "/login",
  validate: validateSchema(directory+'login.json'),
  handler: user.logIn,
});

api.route({ 
  method: "POST",
  path: "/register",
  validate:  validateSchema(directory+'register.json'),
  handler: user.register,
});
 
api.route({ 
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  method: "GET", 
  path: "/profile/:userId",
  handler: user.getProfile,
});
 
api.route({ 
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  method: "DELETE", 
  path: "/profile/:userId",
  handler: user.deleteUser,
});
 
module.exports = api;
