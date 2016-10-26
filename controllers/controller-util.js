var Movie = require('../models/movie');

module.exports = {

    NotFoundError: function (message) {
        Error.call(this);
        this.name = 'NotFoundError';
        this.message = message;
        this.status = 404;
    },

    removeUndefinedPropertyOfObject: function (object) {
        return JSON.parse(JSON.stringify(object));
    },

    getMovieById: function (id, callback) {
        Movie.findOne({_id: id}, function (err, movie) {
            if (movie == null) {
                callback(new module.exports.NotFoundError('Movie does not exist!'));
            } else {
                callback(null, movie);
            }
        });
    }
};