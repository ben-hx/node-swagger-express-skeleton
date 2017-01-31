'use strict';

var moongose = require('mongoose');
var q = require('q');

module.exports = function () {

    return {
        create: function (req, res, next) {
            req.diContainer.getMovieRepository().create(req.body).then(function (movie) {
                res.status(201);
                res.sendData({movie: movie}, 'Movie created!');
            }).catch(function (error) {
                next(error);
            });
        },
        getAll: function (req, res, next) {
            req.diContainer.getMovieRepository().getAll(req.resourceOptions).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        },
        get: function (req, res, next) {
            req.diContainer.getMovieRepository().getById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        update: function (req, res, next) {
            req.diContainer.getMovieRepository().updateById(req.params.movie_id, req.body).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        delete: function (req, res, next) {
            req.diContainer.getMovieRepository().deleteById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        watch: function (req, res, next) {
            req.diContainer.getMovieRepository().setWatchedById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        unwatch: function (req, res, next) {
            req.diContainer.getMovieRepository().deleteWatchedById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        getWatched: function (req, res, next) {
            req.diContainer.getMovieRepository().getWatchedById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        rate: function (req, res, next) {
            req.diContainer.getMovieRepository().setRatingById(req.params.movie_id, req.body.value).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        },
        deleteRating: function (req, res, next) {
            req.diContainer.getMovieRepository().deleteRatingById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(function (error) {
                next(error);
            });
        }
    }

}