require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

const path = require('path');
const Koa = require('koa'); 
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');
const compress = require('koa-compress');
const { koaSwagger } = require('koa2-swagger-ui');
const $RefParser = require('json-schema-ref-parser');
const { server, db } = require('./configs');  
const cors = require('@koa/cors');

// Routers and Middleware
const routers = require('./routers');
const authMiddleware = require('./middleware/auth.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const app = new Koa();
const router = new Router(); 

$RefParser.dereference(path.join(__dirname, '../docs/index.json'))
    .then((openApiDoc) => {
 
        router.get('/', (ctx) => {
            ctx.body = {
                alive: true
            }
        });

        app.use(cors({
            origin: '*', // allow requests from any origin
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // allow these HTTP methods
            allowHeaders: ['Content-Type', 'Authorization'], // allow these headers
        }));
          
        app.use(router.routes()).use(router.allowedMethods());

        app.use(
            koaSwagger({
                routePrefix: '/_docs', // host at /_docs
                swaggerOptions: {
                    spec: openApiDoc,
                },
            }),
        );

        // เปิดใช้เพื่อตรวจสอบ router ทั้งหมดให้รวมถึง ## /login , /register
        // app.use(authMiddleware);

        app.use(errorMiddleware)
        app.use(bodyParser())
        app.use(helmet())
        app.use(compress())
        
        app.use(routers)
        

    })
    .catch(err => {
        console.error("Failed to load OpenAPI documentation", err);
    });

module.exports = app;
