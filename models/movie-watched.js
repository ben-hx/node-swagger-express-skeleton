var movieWatchedModel = require('./models').MovieWatched;
var modelUtil = require('./model-util');

modelUtil.addToObjectToSchemaOptions(movieWatchedModel.schema);

module.exports = movieWatchedModel;