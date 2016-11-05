'use strict';

var MovieRating = require('../models/movie-rating');
var MovieWatched = require('../models/movie-watched');
var controllerUtil = require('./controller-util');

function MovieIsNotWatchedError(message) {
    Error.call(this);
    this.name = 'MovieIsNotWatchedError';
    this.message = message;
    this.status = 400;
}

function getMovieRatingResponseBody(movieId, ownRating, message) {
    var result = {
        success: true,
        data: {
            movieId: movieId,
            ownRating: ownRating
        }
    };
    if (message) {
        result.message = message;
    }
    return result;
}

function getMovieUsersRatingResponseBody(movieId, ownRating, usersRating) {
    var result = {
        success: true,
        data: {
            movieId: movieId,
            ownRating: ownRating,
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
            //console.log(movieRating);
            var ownRating = movieRating.value;

            MovieRating.find({movieId: data.movieId, userId: {'$ne': data.userId }}, function (err, moviesRating) {
                if (err) {
                    return next(err);
                }
                var usersRating = moviesRating.map(function(userMovieRating) {
                    return {userid: userMovieRating.userId, rating: userMovieRating.value};
                });
                res.json(getMovieUsersRatingResponseBody(data.movieId, ownRating, usersRating));
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
                next(new MovieIsNotWatchedError('Movie is not Watched!'));
            });
            return;
        }
        MovieRating.findOneAndUpdate(id, value, {
            upsert: true,
            new: true
        }, function (err, movieRating) {
            if (err) {
                return next(err);
            }
            res.send(getMovieRatingResponseBody(id.movieId, movieRating.value, 'Movie-Rating set to ' + value.value))
        });
    });
};