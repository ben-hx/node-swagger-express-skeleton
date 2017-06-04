'use strict';

var q = require('q');

module.exports = function (postRepository, authorizationService) {

    return {
        create: function (data) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return postRepository.create(data);
        },
        getAll: postRepository.getAll,
        getById: postRepository.getById,
        updateById: function (id, data) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return postRepository.updateById(id, data);
        },
        deleteById: function (id) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return postRepository.deleteById(id);
        },
        addCommentById: function (id, text) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return postRepository.addCommentById(id, text);
        },
        deleteCommentById: function (id, commentId) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return postRepository.deleteCommentById(id, commentId);
        },
        getCommentById: function (id, commentId) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return postRepository.getCommentById(id, commentId);
        }
    }
};