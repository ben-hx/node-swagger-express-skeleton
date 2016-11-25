'use strict';

var q = require('q');

module.exports = function (config, errors, Movie, MovieRating, MovieWatched) {

    function castQueryParamByOptionalArray(param) {
        if (param) {
            if (param instanceof Array) {
                return {"$in": param};
            } else {
                return param;
            }
        }
        return undefined;
    }

    function castQueryParamByBeginning(param) {
        if (param) {
            return {"$regex": param, "$options": "i"};
        }
        return undefined;
    }

    function removeUndefinedPropertyOfObject(object) {
        return JSON.parse(JSON.stringify(object));
    }

    return {
        create: function (movieData, user) {
            var deferred = q.defer();
            movieData.lastModifiedUser = user._id;
            var movie = new Movie(movieData);
            movie.save().then(function (movie) {
                return deferred.resolve(movie.toObject());
            }).catch(function (error) {
                return deferred.reject(new errors.ValidationError(error));
            });
            return deferred.promise;
        },
        getAll: function (options) {
            var deferred = q.defer();
            options = options || {};
            var query = options.query || {};
            var sort = options.sort || '';
            var pagination = options.pagination || {};
            var options = {
                query: {
                    title: castQueryParamByBeginning(query.title),
                    actors: castQueryParamByBeginning(query.actors),
                    year: castQueryParamByOptionalArray(query.years),
                    genres: castQueryParamByOptionalArray(query.genres),
                    lastModifiedUser: castQueryParamByOptionalArray(query.lastModifiedUser)
                },
                sort: sort || config[process.env.NODE_ENV].settings.movie.moviesSortDefault,
                page: parseInt(pagination.page) || 0,
                limit: parseInt(pagination.limit) || config[process.env.NODE_ENV].settings.movie.moviesPerPageDefault
            };
            options = removeUndefinedPropertyOfObject(options);
            Movie.paginate(options).then(function (result) {
                var docs = result.docs.map(function (movie) {
                    return movie.toObject();
                });
                return deferred.resolve({movies: docs, pagination: result.pagination});
            }).catch(function (error) {
                return deferred.reject(error);
            });
            return deferred.promise;
        },
        getById: function (id) {
            var deferred = q.defer();
            Movie.findOne({_id: id}).then(function (movie) {
                if (movie == null) {
                    throw new errors.NotFoundError('Movie does not exist!');
                } else {
                    return deferred.resolve(movie.toObject());
                }
            }).catch(function (error) {
                if (!(error instanceof errors.NotFoundError)) {
                    return deferred.reject(new errors.ValidationError(error));
                }
                return deferred.reject(error);
            });
            return deferred.promise;
        },
        updateById: function (id, movieData, user) {
            var deferred = q.defer();
            movieData = Object.assign({}, movieData);
            movieData.lastModifiedUser = user._id;
            var self = this;
            Movie.update({_id: id}, movieData, {runValidators: true}).then(function (result) {
                return self.getById(id);
            }).then(function (movie) {
                return deferred.resolve(movie);
            }).catch(function (error) {
                if (!(error instanceof errors.NotFoundError)) {
                    return deferred.reject(new errors.ValidationError(error));
                }
                return deferred.reject(error);
            });
            return deferred.promise;
        },
        deleteById: function (id) {
            var deferred = q.defer();
            Movie.findOneAndRemove({_id: id}).then(function (movie) {
                if (movie == null) {
                    throw new errors.NotFoundError('Movie does not exist!');
                } else {
                    return deferred.resolve(movie.toObject());
                }
            }).catch(function (error) {
                if (!(error instanceof errors.NotFoundError)) {
                    return deferred.reject(new errors.ValidationError(error));
                }
                return deferred.reject(error);
            });
            return deferred.promise;
        },

        setWatchedByMovieIdAndUserId: function (movieId, userId) {
            var deferred = q.defer();
            var id = {
                user: userId,
                movie: movieId
            };
            MovieWatched.findOne(id).then(function (watched) {
                if (watched != null) {
                    throw new errors.DuplicationError('Movie already set to watched!');
                }
                var movieWatched = new MovieWatched(id);
                return movieWatched.save();
            }).then(function (watched) {
                return deferred.resolve(watched.toObject());
            }).catch(function (error) {
                return deferred.reject(new errors.ValidationError(error));
            });
            return deferred.promise;
        },

        deleteWatchedByMovieIdAndUserId: function (movieId, userId) {
            var deferred = q.defer();
            var id = {
                user: userId,
                movie: movieId
            };
            MovieWatched.findOne(id).then(function (watched) {
                if (watched === null) {
                    throw new errors.ValidationError('Movie is not set to watched');
                }
                return watched.remove();
            }).then(function (watched) {
                var result = watched.toObject();
                result.watched = false;
                return deferred.resolve(result);
            }).catch(function (error) {
                return deferred.reject(error);
            });
            return deferred.promise;
        },

        getWatchedByMovieIdAndUserId: function (movieId, userId) {
            var deferred = q.defer();
            var id = {
                user: userId,
                movie: movieId
            };
            MovieWatched.findOne(id).then(function (watched) {
                if (watched === null) {
                    return deferred.resolve({
                        user: userId,
                        movie: movieId,
                        watched: false
                    });
                }
                return deferred.resolve(watched.toObject());
            }).catch(function (error) {
                return deferred.reject(new errors.ValidationError(error));
            });
            return deferred.promise;
        },

        getUsersWatchedByMovieId: function (movieId, options) {
            var deferred = q.defer();
            var id = {
                movie: movieId
            };
            var promise = MovieWatched.find(id);
            if (options && options.populate) {
                promise.populate('user').then(function (watched) {
                    var result = watched.map(function (value) {
                        return value.user.toObject();
                    });
                    return deferred.resolve(result);
                });
            } else {
                promise.then(function (watched) {
                    var result = watched.map(function (value) {
                        return value.user;
                    });
                    return deferred.resolve(result);
                });
            }
            promise.catch(function (error) {
                return deferred.reject(new errors.ValidationError(error));
            });
            return deferred.promise;
        },

        getMoviesWatchedByUserId: function (userId, options) {
            var deferred = q.defer();
            var id = {
                user: userId
            };
            var promise = MovieWatched.find(id);
            if (options && options.populate) {
                promise.populate('movie').then(function (watched) {
                    var result = watched.map(function (value) {
                        return value.movie.toObject();
                    });
                    return deferred.resolve(result);
                });
            } else {
                promise.then(function (watched) {
                    var result = watched.map(function (value) {
                        return value.movie;
                    });
                    return deferred.resolve(result);
                });
            }
            promise.catch(function (error) {
                return deferred.reject(new errors.ValidationError(error));
            });
            return deferred.promise
        },

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