'use strict';

var imdb = require('imdb-api');
var omdb = require('omdb');
var Movie = require('../models/movie');

function NotFoundError(message) {
    Error.call(this);
    this.name = 'NotFoundError';
    this.message = message;
    this.status = 404;
}

module.exports.getMovieProposal = function (req, res, next) {

    var queryParams = {
        terms: req.query.title,
        type: 'movie',
        year: 2000
    };

    omdb.search(req.query.title, function(err, movies) {
        if (err) {
            return next(err);
        }
        res.json({success: true, data: movies});
    });

};

