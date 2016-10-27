'use strict';

var Movie = require('../models/movie');
var controllerUtil = require('./controller-util');

module.exports.getGenres = function (req, res, next) {

    Movie.find().distinct('genres').exec(function(err, genres) {
        if (err) {
            next(err);
        }
        res.send({success: true, data: {genres: genres}});
    });

};
