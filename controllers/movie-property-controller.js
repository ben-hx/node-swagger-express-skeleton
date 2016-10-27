'use strict';

var Movie = require('../models/movie');
var controllerUtil = require('./controller-util');

function findByMovieProperty(propertyName, req, res, next) {
    Movie.find().distinct(propertyName).exec(function(err, result) {
        if (err) {
            return next(err);
        }
        var data = {};
        data[propertyName] = result
        return res.send({success: true, data: data});
    });
}

module.exports.getGenres = function (req, res, next) {
    return findByMovieProperty('genres', req, res, next);
};

module.exports.getDirectors = function (req, res, next) {
    return findByMovieProperty('directors', req, res, next);
};

module.exports.getWriters = function (req, res, next) {
    return findByMovieProperty('writers', req, res, next);
};

module.exports.getActors = function (req, res, next) {
    return findByMovieProperty('actors', req, res, next);
};

module.exports.getLanguages = function (req, res, next) {
    return findByMovieProperty('languages', req, res, next);
};