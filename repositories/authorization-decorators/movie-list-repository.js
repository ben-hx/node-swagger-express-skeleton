'use strict';

var q = require('q');

module.exports = function (movieListRepository, authorizationService) {

    return {
        create: function (movieData) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieListRepository.create(movieData);
        },
        getAll: movieListRepository.getAll,
        getById: movieListRepository.getById,
        updateById: function (id, movieData) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieListRepository.updateById(id, movieData);
        },
        deleteById: function (id) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieListRepository.deleteById(id);
        },
        addCommentById: function (id, text) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieListRepository.addCommentById(id, text);
        },
        deleteCommentById: function (id, commentId) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieListRepository.deleteCommentById(id, commentId);
        },
        getCommentById: function (id, commentId) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieListRepository.getCommentById(id, commentId);
        }
    }
};