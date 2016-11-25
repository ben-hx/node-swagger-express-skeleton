var Movie = require('../models/movie');
var errors = require('../errors/errors');

module.exports = {

    removeUndefinedPropertyOfObject: function (object) {
        return JSON.parse(JSON.stringify(object));
    },

    getMovieById: function (id, callback) {
        Movie.findOne({_id: id}, function (err, movie) {
            if (movie == null) {
                callback(new errors.NotFoundError('Movie does not exist!'));
            } else {
                callback(null, movie);
            }
        });
    },
    getUserResponseBody: function (user, message) {
        var result = {
            success: true,
            data: {
                user: user.toObject()
            }
        };
        if (message) {
            result.message = message;
        }
        return result;
    }

};