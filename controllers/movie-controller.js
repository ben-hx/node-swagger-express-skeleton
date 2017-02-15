'use strict';

var ObjectId = require('mongoose').Types.ObjectId;
var q = require('q');

module.exports = function () {

    function isAdmin(req) {
        return req.diContainer.getAuthService().getCurrentUser().role == 'admin'
    }

    return {
        create: function (req, res, next) {
            req.diContainer.getMovieRepository().create(req.body).then(function (movie) {
                res.status(201);
                res.sendData({movie: movie}, 'Movie created!');
            }).catch(next);
        },
        getAll: function (req, res, next) {
            req.diContainer.getMovieRepository().getAll(req.resourceOptions).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(next);
        },
        get: function (req, res, next) {
            req.diContainer.getMovieRepository().getById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(next);
        },
        update: function (req, res, next) {
            req.diContainer.getMovieRepository().updateById(req.params.movie_id, req.body).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(next);
        },
        delete: function (req, res, next) {
            req.diContainer.getMovieRepository().deleteById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(next);
        },
        watch: function (req, res, next) {
            req.diContainer.getMovieRepository().setWatchedById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(next);
        },
        unwatch: function (req, res, next) {
            req.diContainer.getMovieRepository().deleteWatchedById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(next);
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
            }).catch(next);
        },
        deleteRating: function (req, res, next) {
            req.diContainer.getMovieRepository().deleteRatingById(req.params.movie_id).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(next);
        },
        comment: function (req, res, next) {
            req.diContainer.getMovieRepository().addCommentById(req.params.movie_id, req.body.text).then(function (movie) {
                res.status(200);
                res.sendData({movie: movie});
            }).catch(next);
        },
        deleteComment: function (req, res, next) {
            if (isAdmin(req)) {
                req.diContainer.getMovieRepository().deleteCommentFromUserById(req.params.movie_id, req.params.comment_id).then(function (movie) {
                    res.status(200);
                    res.sendData({movie: movie});
                }).catch(next);
            } else {
                req.diContainer.getMovieRepository().deleteCommentById(req.params.movie_id, req.params.comment_id).then(function (movie) {
                    res.status(200);
                    res.sendData({movie: movie});
                }).catch(next);
            }
        },
        getGenres: function (req, res, next) {
            req.diContainer.getMovieProperteyRepository().getGenres().then(function (result) {
                res.status(200);
                res.sendData({genres: result});
            }).catch(next);
        },
        getActors: function (req, res, next) {
            req.diContainer.getMovieProperteyRepository().getActors().then(function (result) {
                res.status(200);
                res.sendData({actors: result});
            }).catch(next);
        }

    }

};