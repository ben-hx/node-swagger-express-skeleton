var movieModel = require('./models').Movie;
var modelUtil = require('./model-util');

modelUtil.addToObjectToSchemaOptions(movieModel.schema);

module.exports = movieModel;