'use strict';

var Movie = require('../models/movie');
var controllerUtil = require('./controller-util');

function NotFoundError(message) {
    Error.call(this);
    this.name = 'NotFoundError';
    this.message = message;
    this.status = 404;
}

function getMovieById(id, callback) {
    Movie.findOne({_id: id}, function (err, movie) {
        if (movie == null) {
            callback(new NotFoundError('Movie does not exist!'));
        } else {
            callback(null, movie);
        }
    });
}

function castQueryParamByOptionalArray(param) {
    if (param) {
        if (param instanceof Array) {
            return {"$in": param};
        } else {
            return param;
        }
    }
    return undefined;
}

function castQueryParamByBeginning(param) {
    if (param) {
        return { "$regex": param, "$options": "i" };
    }
    return undefined;
}

module.exports.createMovie = function create(req, res, next) {
    req.body.userCreatedId = req.user._id;
    var movie = new Movie(req.body);
    movie.save(function (err) {
        if (err) {
            return next(err);
        }
        res.status(201);
        res.send({success: true, message: 'Movie created!', data: movie.toObject()});
    });
};

module.exports.getMovies = function (req, res, next) {

    var queryParams = {
        title: castQueryParamByBeginning(req.query.title),
        actors: castQueryParamByBeginning(req.query.actors),
        year: castQueryParamByOptionalArray(req.query.years),
        userCreatedId: castQueryParamByOptionalArray(req.query.userCreatedIds)
    };

    /* Removing all undefined properties of queryParams */
    queryParams = controllerUtil.removeUndefinedPropertyOfObject(queryParams);

    var cursor = Movie.find(queryParams, function (err, movies) {
        if (err) {
            return next(err);
        }
        var movies = movies.map(function(movie) {
            return movie.toObject();
        });
        res.json({success: true, data: movies});
    });

};

module.exports.getMovie = function (req, res, next) {
    getMovieById(req.swagger.params.movie_id.value, function (err, movie) {
        if (err) {
            return next(err);
        }
        res.json({success: true, data: movie.toObject()});
    });
};

module.exports.updateMovie = function (req, res, next) {
    getMovieById(req.swagger.params.movie_id.value, function (err, movie) {
        if (err) {
            return next(err);
        }
        movie.update(req.body, function (err, movie) {
            if (err) {
                return next(err);
            }
            getMovieById(req.swagger.params.movie_id.value, function (err, movie) {
                if (err) {
                    return next(err);
                }
                res.json({success: true, message: 'Movie updated!', data: movie.toObject()});
            });
        });
    });
};

module.exports.deleteMovie = function (req, res, next) {
    getMovieById(req.swagger.params.movie_id.value, function (err, movie) {
        if (err) {
            return next(err);
        }
        movie.remove(function (err) {
            if (err) {
                return next(err);
            }
            res.json({success: true, message: 'Movie deleted!', data: movie.toObject()});
        });
    });
};