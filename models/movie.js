var movieModel = require('./models').Movie;
var modelUtil = require('./model-util');

modelUtil.addToObjectToSchemaOptions(movieModel.schema);

movieModel.schema.path('title').validate(function (value, done) {
    var id = this._id;
    this.model('Movie').count({title: value, _id: {$ne: id}}, function (error, count) {
        done(!(error || count));
    });
}, 'Movie with the same Title already existing!');

module.exports = movieModel;

