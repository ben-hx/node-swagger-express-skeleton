var movieRatingModel = require('./models').MovieRating;
var modelUtil = require('./model-util');

modelUtil.addToObjectToSchemaOptions(movieRatingModel.schema);

module.exports = movieRatingModel;