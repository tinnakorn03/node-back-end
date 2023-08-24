const fs = require('fs');
const path = require('path');
const Router = require('koa-joi-router') 
const {SwaggerAPI} = require('koa-joi-router-docs')
 
const swaggerAPI = new SwaggerAPI()  
const api = Router() 
  
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' && // exclude this file
      file.slice(-10) === '.router.js' // only include .router.js files
    );
  })
  .forEach(file => {  
    const route = require(path.join(__dirname, file)) 
    api.use(route.middleware())
    swaggerAPI.addJoiRouter(route)
    
  });

module.exports = api.middleware(); 
