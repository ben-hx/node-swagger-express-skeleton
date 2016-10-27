'use strict';

var Movie = require('../models/movie');
var controllerUtil = require('./controller-util');

function getMovieResponseBody(movie, message) {
    var result = {
        success: true,
        data: {
            movie: movie.toObject()
        }
    };
    if (message) {
        result.message = message;
    }
    return result;
}

function getMoviesResponseBody(movies) {
    var result = {
        success: true,
        data: {
            movies: movies
        }
    };
    return result;
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
        res.send(getMovieResponseBody(movie, 'Movie created!'));
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

    Movie.find(queryParams, function (err, movies) {
        if (err) {
            return next(err);
        }
        var movies = movies.map(function(movie) {
            return movie.toObject();
        });
        res.json(getMoviesResponseBody(movies));
    });

};

module.exports.getMovie = function (req, res, next) {
    controllerUtil.getMovieById(req.swagger.params.movie_id.value, function (err, movie) {
        if (err) {
            return next(err);
        }
        res.send(getMovieResponseBody(movie));
    });
};

module.exports.updateMovie = function (req, res, next) {
    controllerUtil.getMovieById(req.swagger.params.movie_id.value, function (err, movie) {
        if (err) {
            return next(err);
        }
        delete req.body._id;
        movie.update(req.body, function (err, movie) {
            if (err) {
                return next(err);
            }
            controllerUtil.getMovieById(req.swagger.params.movie_id.value, function (err, movie) {
                if (err) {
                    return next(err);
                }
                res.send(getMovieResponseBody(movie, 'Movie updated!'));
            });
        });
    });
};

module.exports.deleteMovie = function (req, res, next) {
    controllerUtil.getMovieById(req.swagger.params.movie_id.value, function (err, movie) {
        if (err) {
            return next(err);
        }
        movie.remove(function (err) {
            if (err) {
                return next(err);
            }
            res.json(getMovieResponseBody(movie, 'Movie deleted!'));
        });
    });
};