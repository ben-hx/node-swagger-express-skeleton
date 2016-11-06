var validator = require('validator');
var movieRatingModel = require('./models').MovieRating;
var modelUtil = require('./model-util');

modelUtil.addToObjectToSchemaOptions(movieRatingModel.schema);

movieRatingModel.schema.path('value').validate(function (value, done) {
    var isValid = validator.isInt(value + '', {min: 0, max: 10});
    done(isValid);
}, 'Value has to be between 0 and 10!');

module.exports = movieRatingModel;