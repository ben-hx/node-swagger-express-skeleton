'use strict';

var q = require('q');

module.exports = function (movieRepository, authorizationService) {

    function convertWatchedResult(result) {
        var result = {
            movie: result.movie,
            watched: {
                value: result.watched,
                lastModified: result.lastModified
            }
        };
        return result;
    }

    function convertRatingResult(result) {
        var result = {
            movie: result.movie,
            rating: {
                value: result.value,
                lastModified: result.lastModified
            }
        };
        return result;
    }

    return {
        create: function (movieData) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.create(movieData, authorizationService.getCurrentUser());
        },
        getAll: movieRepository.getAll,
        getById: movieRepository.getById,
        updateById: function (id, movieData) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.updateById(id, movieData, authorizationService.getCurrentUser());
        },
        deleteById: function (id) {
            authorizationService.checkPermission(['admin', 'moderator']);
            return movieRepository.deleteById(id);
        },

        setWatchedById: function (id) {
            return movieRepository.setWatchedByMovieIdAndUserId(id, authorizationService.getCurrentUser()._id).then(convertWatchedResult);
        },

        deleteWatchedById: function (id) {
            return movieRepository.deleteWatchedByMovieIdAndUserId(id, authorizationService.getCurrentUser()._id).then(convertWatchedResult);
        },

        getWatchedById: function (id) {
            return movieRepository.getWatchedByMovieIdAndUserId(id, authorizationService.getCurrentUser()._id).then(convertWatchedResult);
        },

        getUsersWatchedById: function (id) {
            movieRepository.getUsersWatchedByMovieId(id);
        },

        setRatingById: function (id, value) {
            return movieRepository.setRatingByMovieIdAndUserId(id, authorizationService.getCurrentUser()._id, value).then(convertRatingResult);
        },

        deleteRatingById: function (id) {
            return movieRepository.deleteRatingByMovieIdAndUserId(id, authorizationService.getCurrentUser()._id).then(convertRatingResult);
        },

        getAverageRatingId: function (id) {
            return movieRepository.getAverageRatingByMovieId(id);
        },

        getUserRatingById: function (id) {
            return movieRepository.getUsersRatingByMovieId(id);
        },

        getRatingById: function (id) {
            return movieRepository.getRatingByMovieIdAndUserId(id, authorizationService.getCurrentUser()).then(convertRatingResult);
        }
    }
};