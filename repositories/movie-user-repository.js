'use strict';

var q = require('q');

module.exports = function (errors, Movie, MovieRating, MovieWatched) {

    function getAverageRatingById(movieId) {
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
    }

    function getOwnRatingByIds(movieId, userId) {
        var id = {
            userId: movieId,
            movieId: userId
        };
        return MovieRating.findOne(id).then(function (ownRating) {
            return (ownRating ? ownRating.value : null);
        });
    }

    function getOthersRatingByIds(movieId, userId) {
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
    }

    function isWatchedByIds(userId, movieId) {
        var id = {
            userId: userId,
            movieId: movieId,
        };
        return MovieWatched.findOne(id).then(function (watched) {
            return watched != null
        });
    }

    function getOthersWatchedByIds(userId, movieId) {
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
    }

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
            return getAverageRatingById(movieId);
        },
        getAverageRating: function (movie) {
            return getAverageRatingById(movie._id);
        },
        getOwnRatingByIds: function (movieId, ownId) {
            return getOthersRatingByIds(movieId, ownId);
        },
        getOwnRating: function (movie, own) {
            return getOthersRatingByIds(movie._id, own._id);
        }
    }
};