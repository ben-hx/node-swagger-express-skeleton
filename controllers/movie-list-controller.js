'use strict';
var q = require('q');

module.exports = function () {

    return {
        create: function (req, res, next) {
            req.diContainer.getMovieListRepository().create(req.body).then(function (result) {
                res.status(201);
                res.sendData({movieList: result}, 'Movie-List created!');
            }).catch(next);
        },
        getAll: function (req, res, next) {
            req.diContainer.getMovieListRepository().getAll(req.resourceOptions).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(next);
        },
        get: function (req, res, next) {
            req.diContainer.getMovieListRepository().getById(req.params.movie_list_id).then(function (result) {
                res.status(200);
                res.sendData({movieList: result});
            }).catch(next);
        },
        update: function (req, res, next) {
            req.diContainer.getMovieListRepository().updateById(req.params.movie_list_id, req.body).then(function (result) {
                res.status(200);
                res.sendData({movieList: result});
            }).catch(next);
        },
        delete: function (req, res, next) {
            req.diContainer.getMovieListRepository().deleteById(req.params.movie_list_id).then(function (result) {
                res.status(200);
                res.sendData({movieList: result});
            }).catch(next);
        },
        comment: function (req, res, next) {
            req.diContainer.getMovieListRepository().addCommentById(req.params.movie_list_id, req.body.text).then(function (result) {
                res.status(200);
                res.sendData({movieList: result});
            }).catch(next);
        },
        deleteComment: function (req, res, next) {
            req.diContainer.getMovieListRepository().deleteCommentById(req.params.movie_list_id, req.params.comment_id).then(function (result) {
                res.status(200);
                res.sendData({movieList: result});
            }).catch(next);
        }
    }

};