
const path = require('path');
const fs = require('fs');
const { schemaToJoi } = require('./convert')  


module.exports = { 
    validateSchema: (Path) => { 
        const schemaFilePath =path.join(__dirname, Path);
        const openApiSchema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
         
        return {
            body: schemaToJoi(openApiSchema),
            type: "json",
        }
    }
} 