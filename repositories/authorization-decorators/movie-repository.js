'use strict';

var q = require('q');

module.exports = function (movieRepository, authorizationService) {

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

        setWatchedByMovieIdAndUserId: movieRepository.setWatchedByMovieIdAndUserId,

        deleteWatchedByMovieIdAndUserId: movieRepository.deleteWatchedByMovieIdAndUserId,

        getWatchedByMovieIdAndUserId: movieRepository.getWatchedByMovieIdAndUserId,

        getUsersWatchedByMovieId: movieRepository.getUsersWatchedByMovieId,

        getMoviesWatchedByUserId: movieRepository.getMoviesWatchedByUserId,

        setRatingByMovieIdAndUserId: movieRepository.setRatingByMovieIdAndUserId,

        deleteRatingByMovieIdAndUserId: movieRepository.deleteRatingByMovieIdAndUserId,

        getAverageRatingByMovieId: movieRepository.getAverageRatingByMovieId,

        getUsersRatingByMovieId: movieRepository.getUsersRatingByMovieId,

        getRatingByMovieIdAndUserId: movieRepository.getRatingByMovieIdAndUserId
    }
};