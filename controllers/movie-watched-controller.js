'use strict';

var MovieWatched = require('../models/movie-watched');
var controllerUtil = require('./controller-util');

function NotFoundError(message) {
    Error.call(this);
    this.name = 'NotFoundError';
    this.message = message;
    this.status = 404;
}

module.exports.isMovieWatched = function (req, res, next) {
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
                res.json({success: true, data: {movieId: data.movieId, watched: false}});
            } else {
                res.json({success: true, data: {movieId: data.movieId, watched: true}});
            }
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
                    res.send({success: true, message: 'Movie set to watched!', data: {movieId: data.movieId, watched: true}});
                });
            } else {
                res.json({success: true, message: 'Movie already set to watched!', data: {movieId: data.movieId, watched: true}});
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
                res.json({success: true, message: 'Movie is already unwatched!', data: {movieId: data.movieId, watched: false}});
                return;
            }
            watched.remove(function (err) {
                if (err) {
                    return next(err);
                }
                res.json({success: true, message: 'Movie set to unwatched!', data: {movieId: data.movieId, watched: false}});
            });
        });
    });
};
