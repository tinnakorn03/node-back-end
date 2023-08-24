const fs = require('fs')
const camelCase = require('camelcase')
const path = require('path')

const fileName = path.basename(__filename)
const controllers = {}
fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== fileName && file.slice(-3) === '.js'
  })
  .forEach((file) => {
    const controllerName = file.split('.')
    const converterCamelCase = camelCase(controllerName[0])
    controllers[converterCamelCase] = require(path.join(__dirname, file))
  })

module.exports = controllers
