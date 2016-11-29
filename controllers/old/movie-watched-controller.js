'use strict';

var MovieWatched = require('../../models/movie-watched');
var controllerUtil = require('./controller-util');

function getMovieWatchedResponseBody(movieId, watched, message) {
    var result = {
        success: true,
        data: {
            movieId: movieId,
            watched: watched
        }
    };
    if (message) {
        result.message = message;
    }
    return result;
}

function getMovieUsersWatchedResponseBody(movieId, users, watched) {
    var result = {
        success: true,
        data: {
            movieId: movieId,
            users: users,
            watched: watched
        }
    };
    return result;
}

module.exports.getMovieWatched = function (req, res, next) {
    var data = {
        userId: req.user._id,
        movieId: req.swagger.params.movie_id.value
    };
    controllerUtil.getMovieById(data.movieId, function (err, movie) {
        if (err) {
            return next(err);
        }
        MovieWatched.find({movieId: data.movieId, userId: {'$ne': data.userId }}, function (err, moviesWatched) {
            if (err) {
                return next(err);
            }
            var users = moviesWatched.map(function(movieWatched) {
                return movieWatched.userId;
            });
            MovieWatched.findOne(data, function (err, watched) {
                if (err) {
                    return next(err);
                }
                res.json(getMovieUsersWatchedResponseBody(data.movieId, users, watched !== null));
            });
        });
    });
};

module.exports.setMovieWatched = function (req, res, next) {
    var data = {
        userId: req.user._id,
        movieId: req.swagger.params.movie_id.value
    };
    controllerUtil.getMovieById(data.movieId, function (err, movie) {
        if (err) {
            return next(err);
        }
        MovieWatched.findOne(data, function (err, watched) {
            if (watched === null) {
                var movieWatched = new MovieWatched(data);
                movieWatched.save(function (err, watched) {
                    if (err) {
                        return next(err);
                    }
                    res.send(getMovieWatchedResponseBody(data.movieId, true, 'Movie set to watched!'));
                });
            } else {
                res.send(getMovieWatchedResponseBody(data.movieId, true, 'Movie already set to watched!'));
            }
        });
    });
};

module.exports.setMovieUnwatched = function (req, res, next) {
    var data = {
        userId: req.user._id,
        movieId: req.swagger.params.movie_id.value
    };

    controllerUtil.getMovieById(data.movieId, function (err, movie) {
        if (err) {
            return next(err);
        }
        MovieWatched.findOne(data, function (err, watched) {
            if (err) {
                return next(err);
            }
            if (!watched) {
                res.send(getMovieWatchedResponseBody(data.movieId, false, 'Movie is already unwatched!'));
                return;
            }
            watched.remove(function (err) {
                if (err) {
                    return next(err);
                }
                res.send(getMovieWatchedResponseBody(data.movieId, false, 'Movie is set unwatched!'));
            });
        });
    });
};
