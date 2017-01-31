'use strict';

var q = require('q');

module.exports = function (movieRepository, authorizationService) {

    return {
        create: function (movieData) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.create(movieData);
        },
        getAll: movieRepository.getAll,
        getById: movieRepository.getById,
        updateById: function (id, movieData) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.updateById(id, movieData);
        },
        deleteById: function (id) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.deleteById(id);
        },
        setWatchedById: function (id) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.setWatchedById(id);
        },
        deleteWatchedById: function (id) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.deleteWatchedById(id);
        },
        setRatingById: function (id, value) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.setRatingById(id, value);
        },
        deleteRatingById: function (id) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.deleteRatingById(id);
        }
    }
};