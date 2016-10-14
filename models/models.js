var swaggerMongoose = require('swagger-mongoose');
var swaggerDoc = require('../definitions/swagger-doc');
module.exports = swaggerMongoose.compile(swaggerDoc.document).models;