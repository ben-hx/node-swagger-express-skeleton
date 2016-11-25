'use strict';

var q = require('q');

module.exports = function (errors, Movie, MovieRating, MovieWatched) {

    return {
        getRatingByIds: function (movieId, userId) {
            var deferred = q.defer();
            var data = {
                userId: userId,
                movieId: movieId
            };
            q.all([
                getAverageRatingById(data.movieId),
                getOwnRankingByIds(data.movieId, data.userId),
                getOthersRankingByIds(data.movieId, data.userId),
            ]).spread(function (averageRating, ownRanking, othersRanking) {
                var result = {
                    averageRating: averageRating,
                    ownRanking: ownRanking,
                    othersRanking: othersRanking
                };
                return deferred.resolve(result);
            }).catch(function (error) {
                return deferred.reject(error);
            });
            return deferred.promise;
        },
        getRating: function (movie, user) {
            return this.getRatingByIds(movie._id, user._id);
        },
        getAverageRatingById: function (movieId) {
            return MovieRating.aggregate([{
                $match: {
                    movieId: movieId
                }
            }, {
                $group: {
                    _id: "$movieId",
                    value: {$avg: "$value"}
                }
            }]).then(function (averageMovieRating) {
                return (averageMovieRating.length > 0 ? averageMovieRating[0].value : 0);
            });
        },
        getAverageRating: function (movie) {
            return this.getAverageRatingById(movie._id);
        },
        getOwnRatingByIds: function (movieId, ownId) {
            var id = {
                userId: movieId,
                movieId: userId
            };
            return MovieRating.findOne(id).then(function (ownRating) {
                return (ownRating ? ownRating.value : null);
            });
        },
        getOwnRating: function (movie, own) {
            return getOthersRatingByIds(movie._id, own._id);
        },
        getOthersRatingByIds: function (movieId, ownId) {
            var id = {
                userId: movieId,
                movieId: userId
            };
            return MovieRating.find({movieId: id.movieId, userId: {'$ne': id.userId}}).then(function (moviesRating) {
                var result = moviesRating.map(function (userMovieRating) {
                    return {userid: userMovieRating.userId, rating: userMovieRating.value};
                });
                return result;
            });
        },
        getOthersRating: function (movie, own) {
            return this.getOthersRatingByIds(movie._id, own._id);
        },
        isWatchedByIds: function (movieId, ownId) {
            var id = {
                userId: userId,
                movieId: movieId,
            };
            return MovieWatched.findOne(id).then(function (watched) {
                return watched != null
            });
        },
        isWatched: function (movie, own) {
            return this.isWatchedByIds(movie._id, own._id);
        },

        getOthersWatchedByIds: function (movieId, ownId) {
            var id = {
                userId: movieId,
                movieId: userId
            };
            return MovieWatched.find({movieId: id.movieId, userId: {'$ne': id.userId}}).then(function (moviesWatched) {
                var result = moviesWatched.map(function (userMovieWatched) {
                    return userMovieWatched.userId;
                });
                return result;
            });
        },
        getOthersWatched: function (movie, own) {
            return this.getOthersWatchedByIds(movie._id, own._id);
        },

    }
};