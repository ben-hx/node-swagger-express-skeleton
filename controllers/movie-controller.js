'use strict';

var moongose = require('mongoose');
var q = require('q');

module.exports = function (MovieRepository) {

    return {
        create: function (req, res, next) {
            MovieRepository.create(req.body).then(function (movie) {
                res.status(201);
                res.sendData({movie: movie}, 'Movie created!');
            }).catch(function (error) {
                next(error);
            });
        },
        getAll: function (req, res, next) {
            MovieRepository.getAll(req.resourceOptions).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        },
        get: function (req, res, next) {
            MovieRepository.getById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        update: function (req, res, next) {
            MovieRepository.updateById(req.params.movie_id, req.body).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        delete: function (req, res, next) {
            MovieRepository.deleteById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        watch: function (req, res, next) {
            MovieRepository.setWatchedById(req.params.movie_id).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        },
        unwatch: function (req, res, next) {
            MovieRepository.deleteWatchedById(req.params.movie_id).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        },
        getWatched: function (req, res, next) {
            MovieRepository.getWatchedById(req.params.movie_id).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        },
        rate: function (req, res, next) {
            MovieRepository.setRatingById(req.params.movie_id, req.body.value).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        },
        deleteRating: function (req, res, next) {
            MovieRepository.deleteRatingById(req.params.movie_id).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        },
        getRating: function (req, res, next) {
            q.all([
                MovieRepository.getRatingById(req.params.movie_id),
                MovieRepository.getAverageRatingId(req.params.movie_id)
            ]).then(function (data) {
                var result = data[0];
                result.averageRating = {value: data[1]};
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        },
    }

}