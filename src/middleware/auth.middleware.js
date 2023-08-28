const { secret } = require('./../configs')
const jwt = require('jsonwebtoken')
const { result_error} = require("./../commons/convert");
 
module.exports = async (ctx, next) => { 
   let { authorization } = ctx.request.headers

   if (!authorization) {
      ctx.status = 403 
      ctx.body = result_error(403,{name: 'Check Token',message: 'Check if you have given the token or not.'}) 
     
      return
   }

   // Check if the Authorization header is in the correct format
   if (!authorization.startsWith('Bearer ')) {
      ctx.status = 401
      ctx.body = result_error(401,{name: 'Error Format Token',message: 'Invalid Authorization header format. Format is "Authorization: Bearer <token>"'}) 
      return
   }

   // Remove Bearer from string
   let token = authorization.slice(7, authorization.length);
   
   return jwt.verify(token, secret, (err, decoded) => {
      if (err) {
         ctx.status = 401 
         ctx.body = result_error(401,{name: 'Unauthorized',message: 'Your token is invalid. or expired'})  
         return
      }
      ctx.request.adminUser = decoded
      return next()
   })
}

