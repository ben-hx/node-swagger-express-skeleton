'use strict';

var q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (config, errors, UserRepository, Movie, MovieUserAction) {

    return {
        forUser: function (user) {
            checkUserExistance(user);

            function checkUserExistance(user) {
                return UserRepository.getUserById(user._id);
            }

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

            function findWatchedById(movieId, userId) {
                return MovieUserAction.findOne({movie: movieId})
                    .where('watched.user', userId)
                    .select({'watched.$': 1});
            }

            function findRatingsById(movieId, userId) {
                return MovieUserAction.findOne({movie: movieId})
                    .where('ratings.user', userId)
                    .select({'ratings.$': 1});
            }

            function findMovieById(id) {
                return MovieUserAction.findOne({movie: id}).populate('movie watched.user ratings.user').then(function (result) {
                    if (result == null) {
                        throw new errors.NotFoundError('Movie does not exist!');
                    }
                    return result;
                });
            }

            function movieUserActionToResponse(movieUserAction) {
                var self = this;
                var ownWatched = {value: false};
                var userWatched = movieUserAction.watched.reduce(function (userWatched, watched) {
                    if (watched.user._id.equals(user._id)) {
                        ownWatched.value = true;
                        ownWatched.date = watched.date;
                    } else {
                        userWatched.push(watched.toObject())
                    }
                    return userWatched;
                }, []);
                var ownRating = null;
                var averageRating = 0;
                var ratingsCount = 0;
                var userRatings = movieUserAction.ratings.reduce(function (userRatings, rating) {
                    ratingsCount++;
                    averageRating += rating.value;
                    if (rating.user._id.equals(user._id)) {
                        ownRating = {};
                        ownRating.value = rating.value;
                        ownRating.date = rating.date;
                    } else {
                        userRatings.push(rating.toObject());
                    }
                    return userRatings;
                }, []);
                var movie = movieUserAction.movie.toObject();
                averageRating = averageRating / ratingsCount || null;
                movie = Object.assign(movie, {ownWatched: ownWatched});
                movie = Object.assign(movie, {userWatched: userWatched});
                movie = Object.assign(movie, {ownRating: ownRating});
                movie = Object.assign(movie, {userRatings: userRatings});
                movie = Object.assign(movie, {averageRating: averageRating});
                return movie;
            }

            return {
                create: function (movieData) {
                    var self = this;
                    var deferred = q.defer();
                    movieData.lastModifiedUser = user._id;
                    var movie = new Movie(movieData);
                    movie.save().then(function (movie) {
                        var newValue = {movie: movie, watched: [], ratings: []};
                        return new MovieUserAction(newValue).save().then(function (result) {
                            return movieUserActionToResponse(newValue);
                        });
                    }).then(function (result) {
                        return deferred.resolve(result);
                    }).catch(function (error) {
                        return deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },

                getAll: function (options) {
                    var self = this;
                    var deferred = q.defer();
                    options = options || {};
                    var query = options.query || {};
                    options = {
                        //query:
                        sort: options.sort || config.settings.movie.moviesSortDefault,
                        page: parseInt(options.page) || 0,
                        limit: parseInt(options.limit) || config.settings.movie.moviesPerPageDefault,
                        populate: {
                            path: 'movie watched.user ratings.user',
                            match: {
                                title: castQueryParamByBeginning(query.title),
                                actors: castQueryParamByBeginning(query.actors),
                                year: castQueryParamByOptionalArray(query.years),
                                genres: castQueryParamByOptionalArray(query.genres),
                                lastModifiedUser: castQueryParamByOptionalArray(query.lastModifiedUser)
                            }
                        }
                    };
                    options = removeUndefinedPropertyOfObject(options);

                    MovieUserAction.paginate(options).then(function (result) {
                        var docs = result.docs.reduce(function (docs, movieUserAction) {
                            if (movieUserAction.movie) {
                                docs.push(movieUserActionToResponse(movieUserAction));
                            }
                            return docs;
                        }, []);
                        return deferred.resolve({movies: docs, pagination: result.pagination});
                    }).catch(function (error) {
                        return deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },

                getById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    var populate = {path: 'movie watched ratings'};
                    findMovieById(id).then(function (result) {
                        return deferred.resolve(movieUserActionToResponse(result));
                    }).catch(function (error) {
                        return deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                updateById: function (id, data) {
                    var self = this;
                    var deferred = q.defer();
                    delete data._id;
                    data.lastModifiedUser = user._id;
                    Movie.findOne({_id: id}).then(function (movie) {
                        if (movie == null) {
                            throw new errors.NotFoundError('Movie does not exist!');
                        }
                        movie = Object.assign(movie, data);
                        return movie.save();
                    }).then(function (movie) {
                        return self.getById(id);
                    }).then(function (result) {
                        return deferred.resolve(result);
                    }).catch(function (error) {
                        return deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                deleteById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    findMovieById(id).then(function (result) {
                        return MovieUserAction.remove().exec().then(function () {
                            return movieUserActionToResponse(result);
                        });
                    }).then(function (result) {
                        return Movie.findOneAndRemove({movie: id}).then(function () {
                            return result;
                        });
                    }).then(function (result) {
                        return deferred.resolve(result);
                    }).catch(function (error) {
                        return deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },

                setWatchedById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    q.all([
                        findMovieById(id),
                        findWatchedById(id, user._id)
                    ]).then(function (result) {
                        var movie = result[0];
                        var isWatched = result[1];
                        if (isWatched) {
                            throw new errors.ValidationError('Movie already set to watched!');
                        }
                        movie.watched.addToSet({user: user});
                        return movie.save();
                    }).then(function (result) {
                        deferred.resolve(movieUserActionToResponse(result));
                    }).catch(function (error) {
                        return deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                deleteWatchedById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    q.all([
                        findMovieById(id),
                        findWatchedById(id, user._id)
                    ]).then(function (result) {
                        var movie = result[0];
                        var watched = result[1];
                        if (!watched) {
                            throw new errors.ValidationError('Movie is not set to watched!');
                        }
                        movie.watched.pull(watched.watched[0]._id);
                        return movie.save().then(function () {
                            return movie;
                        });
                    }).then(function (result) {
                        deferred.resolve(movieUserActionToResponse(result));
                    }).catch(function (error) {
                        return deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                setRatingById: function (id, value) {
                    var self = this;
                    var deferred = q.defer();
                    q.all([
                        findMovieById(id),
                        findWatchedById(id, user._id),
                        findRatingsById(id, user._id)
                    ]).then(function (result) {
                        var movie = result[0];
                        var watched = result[1];
                        var rating = result[2];
                        if (!watched) {
                            throw new errors.ValidationError('Movie is not set to watched!');
                        }
                        if (rating) {
                            movie.ratings.pull(rating.ratings[0]._id);
                            return movie.save().then(function () {
                                return movie;
                            });
                        }
                        return movie;
                    }).then(function (result) {
                        result.ratings.addToSet({user: user, value: value});
                        return result.save();
                    }).then(function (result) {
                        deferred.resolve(movieUserActionToResponse(result));
                    }).catch(function (error) {
                        return deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                deleteRatingById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    q.all([
                        findMovieById(id),
                        findRatingsById(id, user._id)
                    ]).then(function (result) {
                        var movie = result[0];
                        var rating = result[1];
                        if (!rating || rating.length == 0) {
                            throw new errors.ValidationError('Movie is not rated!');
                        }
                        movie.ratings.pull(rating.ratings[0]._id);
                        return movie.save().then(function () {
                            return movie;
                        });
                    }).then(function (result) {
                        deferred.resolve(movieUserActionToResponse(result));
                    }).catch(function (error) {
                        return deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
            }
        }
    };
};