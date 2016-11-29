'use strict';

var MovieRating = require('../../models/movie-rating');
var MovieWatched = require('../../models/movie-watched');
var controllerUtil = require('./controller-util');
var errors = require('../../errors/errors');

function getMovieRatingResponseBody(movieId, ownRating, averageRating, message) {
    var result = {
        success: true,
        data: {
            movieId: movieId,
            ownRating: ownRating,
            averageRating: averageRating
        }
    };
    if (message) {
        result.message = message;
    }
    return result;
}

function getMovieUsersRatingResponseBody(movieId, ownRating, averageRating, usersRating) {
    var result = {
        success: true,
        data: {
            movieId: movieId,
            ownRating: ownRating,
            averageRating: averageRating,
            usersRating: usersRating
        }
    };
    return result;
}

function isMovieWatched(userId, movieId, callback) {
    var id = {
        userId: userId,
        movieId: movieId,
    };
    MovieWatched.findOne(id, function (err, watched) {
        callback(watched != null);
    });
}

function getMovieAverageRating(movieId, callback) {
    MovieRating.aggregate([{
        $match: {
            movieId: movieId
        }
    }, {
        $group: {
            _id: "$movieId",
            value: {$avg: "$value"}
        }
    }
    ], function (err, averageMovieRating) {
        if (err) {
            return callback(err);
        }
        var averageRating = (averageMovieRating.length > 0 ? averageMovieRating[0].value : 0);
        return callback(null, averageRating);
    });
}

module.exports.getMovieRating = function (req, res, next) {
    var data = {
        userId: req.user._id,
        movieId: req.swagger.params.movie_id.value
    };
    controllerUtil.getMovieById(data.movieId, function (err, movie) {
        if (err) {
            return next(err);
        }
        MovieRating.findOne(data, function (err, movieRating) {
            if (err) {
                return next(err);
            }
            var ownRating = (movieRating ? movieRating.value : null);
            getMovieAverageRating(data.movieId, function (err, averageMovieRating) {
                if (err) {
                    return next(err);
                }
                MovieRating.find({movieId: data.movieId, userId: {'$ne': data.userId}}, function (err, moviesRating) {
                    if (err) {
                        return next(err);
                    }
                    var usersRating = moviesRating.map(function (userMovieRating) {
                        return {userid: userMovieRating.userId, rating: userMovieRating.value};
                    });
                    res.json(getMovieUsersRatingResponseBody(data.movieId, ownRating, averageMovieRating, usersRating));
                });
            });
        });
    });
};

module.exports.setMovieRating = function (req, res, next) {
    var id = {
        userId: req.user._id,
        movieId: req.swagger.params.movie_id.value,
    };
    var value = {value: req.body.value};
    isMovieWatched(id.userId, id.movieId, function (result) {
        if (!result) {
            controllerUtil.getMovieById(id.movieId, function (err, movie) {
                if (err) {
                    next(err);
                }
                next(new errors.ValidationError({message: 'Movie is not Watched!'}));
            });
            return;
        }
        MovieRating.findOneAndUpdate(id, value, {
            runValidators: true,
            upsert: true,
            new: true
        }, function (err, movieRating) {
            if (err) {
                return next(err);
            }
            var ownRating = movieRating.value;
            getMovieAverageRating(id.movieId, function (err, averageMovieRating) {
                if (err) {
                    return next(err);
                }
                res.send(getMovieRatingResponseBody(id.movieId, ownRating, averageMovieRating, 'Movie-Rating set to ' + value.value));
            });
        });
    });
};