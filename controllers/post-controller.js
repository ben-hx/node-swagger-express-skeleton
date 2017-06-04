'use strict';
var q = require('q');

module.exports = function () {

    return {
        create: function (req, res, next) {
            req.diContainer.getPostRepository().create(req.body).then(function (result) {
                res.status(201);
                res.sendData({post: result}, 'Post created!');
            }).catch(next);
        },
        getAll: function (req, res, next) {
            req.diContainer.getPostRepository().getAll(req.resourceOptions).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(next);
        },
        get: function (req, res, next) {
            req.diContainer.getPostRepository().getById(req.params.post_id).then(function (result) {
                res.status(200);
                res.sendData({post: result});
            }).catch(next);
        },
        update: function (req, res, next) {
            req.diContainer.getPostRepository().updateById(req.params.post_id, req.body).then(function (result) {
                res.status(200);
                res.sendData({post: result});
            }).catch(next);
        },
        delete: function (req, res, next) {
            req.diContainer.getPostRepository().deleteById(req.params.post_id).then(function (result) {
                res.status(200);
                res.sendData({post: result});
            }).catch(next);
        },
        comment: function (req, res, next) {
            req.diContainer.getPostRepository().addCommentById(req.params.post_id, req.body.text).then(function (result) {
                res.status(200);
                res.sendData({post: result});
            }).catch(next);
        },
        deleteComment: function (req, res, next) {
            req.diContainer.getPostRepository().deleteCommentById(req.params.post_id, req.params.comment_id).then(function (result) {
                res.status(200);
                res.sendData({post: result});
            }).catch(next);
        }
    }

};