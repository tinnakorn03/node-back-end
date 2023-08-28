const axios = require('axios')
const Router = require("koa-joi-router");
let Joi = Router.Joi;  

const schemaToJoi = (openApiSchema) => {
    const properties = openApiSchema.properties;
    const requiredProperties = new Set(openApiSchema.required || []);

    const joiSchema = {};

    for (let propertyName in properties) {
        let property = properties[propertyName];
        let isRequired = requiredProperties.has(propertyName);
        let joiValidator;

        if (property.oneOf) {
            const alternatives = property.oneOf.map(subSchema => schemaToJoi({ properties: { [propertyName]: subSchema } })[propertyName]);
            joiValidator = Joi.alternatives().try(...alternatives);
        } else {
            switch (property.type) {
                case 'string':
                    joiValidator = Joi.string();
                    break;
                case 'integer':
                    joiValidator = Joi.number().integer();
                    break;
                case 'number':
                    joiValidator = Joi.number();
                    break;
                case 'boolean':
                    joiValidator = Joi.boolean();
                    break;
                case 'object':
                    joiValidator = Joi.object(schemaToJoi(property));
                    break;
                case 'array':
                    joiValidator = Joi.array().items(schemaToJoi(property.items));
                    break;
                case 'date':
                    joiValidator = Joi.date();
                    break;
                case 'binary':
                    joiValidator = Joi.binary();
                    break;
                case 'symbol':
                    joiValidator = Joi.symbol();
                    break;
                case 'function':
                    joiValidator = Joi.func();
                    break;
                case 'alternatives':
                    joiValidator = Joi.alternatives();
                    break;
                default:
                    throw new Error(`Unsupported type ${property.type}`);
            }
        }

        if (isRequired) {
            joiValidator = joiValidator.required();
        } else {
            joiValidator = joiValidator.allow(null).default(null);
        }

        joiSchema[propertyName] = joiValidator;
    }

    return joiSchema;
}


module.exports = { 
    schemaToJoi,
    result: (status, data = null) => {
        let message;

        switch(status) { 
            case 202:
                message = "Success Accepted";
                break; 
            default:
                message = "Successful";
        }

        let response = {status: status, message: message};
        if(data != null) {
            response['data'] = data;
        }
        return response;
    },
    result_error: (status, error = null) => {
        let message;

        switch(status) {
            case 400:
                message = "Bad Request";
                break;
            case 401:
                message = "Unauthorized";
                break;
            case 403:
                message = "No token provided!";
                break;
            case 500:
                message = "Internal Server Error";
                break;
            case 404:
                message = "Data Not Found";
                break;
            default:
                message = "An unexpected error occurred";
        }

        let response = {
            status: status,
            message: message,
            data: {
                error_code: error.name,
                error_description: error.message
            }
        };
        
        if (error) {
            response.data = {
                error_code: error.name,
                error_description: error.message
            };
    
            if(error.hasOwnProperty('status_code')) {
                response.data['error_code'] = error.status_code;
            }
        }
    
        return response;
    } 
}
