'use strict';

var q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (config, errors, repositoryUtil, UserRepository, Movie) {

    var populationFields = 'createdUser watched.user ratings.user comments.user';

    return {
        forUser: function (user) {
            checkUserExistance(user);

            function checkUserExistance(user) {
                return UserRepository.getUserById(user._id);
            }

            function findWatchedById(movieId, userId) {
                return Movie.findOne({_id: movieId})
                    .where('watched.user', userId)
                    .select({'watched.$': 1});
            }

            function findRatingsById(movieId, userId) {
                return Movie.findOne({_id: movieId})
                    .where('ratings.user', userId)
                    .select({'ratings.$': 1});
            }

            function findMovieById(id) {
                return Movie.findOne({_id: id}).populate(populationFields).then(function (result) {
                    if (result == null) {
                        throw new errors.NotFoundError('Movie does not exist!');
                    }
                    return result;
                });
            }

            function movieToResponse(movie) {
                var self = this;
                var ownWatched = {value: false};
                var userWatched = movie.watched.reduce(function (userWatched, watched) {
                    if (!watched.user) {
                        return;
                    }
                    if (watched.user._id.equals(user._id)) {
                        ownWatched.value = true;
                        ownWatched.date = watched.date;
                    } else {
                        userWatched.push(watched.toObject())
                    }
                    return userWatched;
                }, []);
                var ownRating = null;
                var userRatings = movie.ratings.reduce(function (userRatings, rating) {
                    if (!rating.user) {
                        return;
                    }
                    if (rating.user._id.equals(user._id)) {
                        ownRating = {};
                        ownRating.value = rating.value;
                        ownRating.date = rating.date;
                    } else {
                        userRatings.push(rating.toObject());
                    }
                    return userRatings;
                }, []);
                var userComments = movie.comments.reduce(function (userComments, comment) {
                    if (!comment.user) {
                        return;
                    }
                    userComments.push(comment.toObject());
                    return userComments;
                }, []);

                var movie = movie.toObject();
                movie = Object.assign(movie, {ownWatched: ownWatched});
                movie = Object.assign(movie, {userWatched: userWatched});
                movie = Object.assign(movie, {ownRating: ownRating});
                movie = Object.assign(movie, {userRatings: userRatings});
                movie = Object.assign(movie, {userComments: userComments});
                return movie;
            }

            return {
                create: function (movieData) {
                    var self = this;
                    var deferred = q.defer();
                    movieData.createdUser = user._id;
                    movieData.watched = [];
                    movieData.ratings = [];
                    movieData.comments = [];
                    var movie = new Movie(movieData);
                    movie.save().then(function (result) {
                        return Movie.populate(result, 'createdUser');
                    }).then(function (result) {
                        deferred.resolve(movieToResponse(result));
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                getAll: function (options) {
                    options = options || {};
                    var self = this;
                    var deferred = q.defer();
                    var query = options.query || {};
                    options = {
                        query: {
                            $or: repositoryUtil.castEmptyArrayToUndefined(
                                repositoryUtil.removeEmptyObjectsOfArray([
                                    {title: repositoryUtil.castQueryParamByBeginning(query.title)},
                                    {titleAlias: repositoryUtil.castQueryParamByBeginning(query.title)}
                                ])
                            ),
                            actors: repositoryUtil.castQueryParamByBeginning(query.actors),
                            year: repositoryUtil.castQueryParamByOptionalRange(query.yearFrom, query.yearTo),
                            genres: repositoryUtil.castQueryParamByOptionalArray(query.genres),
                            tags: repositoryUtil.castQueryParamByOptionalArray(query.tags),
                            createdUser: repositoryUtil.castQueryParamByOptionalArray(query.createdUser),
                            lastModifiedUser: repositoryUtil.castQueryParamByOptionalArray(query.lastModifiedUser),
                            created: repositoryUtil.castQueryParamByOptionalDateRange(query.createdFrom, query.createdTo),
                            averageRating: repositoryUtil.castQueryParamByOptionalRange(query.averageRatingFrom, query.averageRatingTo)
                        },
                        sort: options.sort || config.settings.movie.moviesSortDefault,
                        page: parseInt(options.page) || 0,
                        limit: parseInt(options.limit) || config.settings.movie.moviesPerPageDefault,
                        populate: {
                            path: populationFields
                        }
                    };
                    options.query = repositoryUtil.removeUndefinedPropertiesOfObject(options.query);
                    Movie.paginate(options).then(function (result) {
                        var docs = result.docs.reduce(function (docs, movie) {
                            docs.push(movieToResponse(movie));
                            return docs;
                        }, []);
                        deferred.resolve({movies: docs, pagination: result.pagination});
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                getById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    findMovieById(id).then(function (result) {
                        return deferred.resolve(movieToResponse(result));
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
                updateById: function (id, data) {
                    var self = this;
                    var deferred = q.defer();
                    delete data._id;
                    delete data.watched;
                    delete data.ratings;
                    delete data.comments;
                    delete data.createdUser;
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
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
                deleteById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    findMovieById(id).then(function (result) {
                        return result.remove().then(function () {
                            return movieToResponse(result);
                        });
                    }).then(function (result) {
                        return deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
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
                        return self.getById(id);
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
                deleteWatchedById: function (id) {
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
                        }
                        movie.watched.pull(watched.watched[0]._id);
                        return movie.save();
                    }).then(function (result) {
                        return self.getById(id);
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
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
                    }).then(function (movie) {
                        movie.ratings.addToSet({user: user, value: value});
                        return movie.save();
                    }).then(function (result) {
                        return self.getById(id);
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
                deleteRatingById: function (id) {
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
                        if (!rating || rating.length == 0) {
                            throw new errors.ValidationError('Movie is not rated!');
                        }
                        movie.ratings.pull(rating.ratings[0]._id);
                        return movie.save();
                    }).then(function (result) {
                        return self.getById(id);
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
                addCommentById: function (id, text) {
                    var self = this;
                    var deferred = q.defer();
                    findMovieById(id).then(function (movie) {
                        movie.comments.push({user: user, text: text});
                        return movie.save();
                    }).then(function (result) {
                        return self.getById(id);
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
                deleteCommentFromUserById: function (id, commentId) {
                    var self = this;
                    var deferred = q.defer();
                    findMovieById(id).then(function (movie) {
                        if (!ObjectId.isValid(commentId) || movie.comments.id(commentId) == null) {
                            throw new errors.NotFoundError('Comment not found!');
                        }
                        movie.comments.pull(commentId);
                        return movie.save();
                    }).then(function (result) {
                        return self.getById(id);
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
                deleteCommentById: function (id, commentId) {
                    var self = this;
                    var deferred = q.defer();
                    findMovieById(id).then(function (movie) {
                        var comment = movie.comments.id(commentId);
                        if (comment == null) {
                            throw new errors.NotFoundError('Comment not found!');
                        }
                        if (comment.user == null) {
                            throw new errors.ValidationError('User of Comment not found!');
                        }
                        if (!comment.user._id.equals(user._id)) {
                            throw new errors.AuthenticationError('User is not allowed to delete the Comment');
                        }
                        movie.comments.pull(commentId);
                        return movie.save();
                    }).then(function (result) {
                        return self.getById(id);
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
                ,
                getCommentById: function (id, commentId) {
                    var self = this;
                    var deferred = q.defer();
                    findMovieById(id).then(function (movie) {
                        var comment = movie.comments.id(commentId);
                        if (comment == null) {
                            throw new errors.NotFoundError('Comment not found!');
                        }
                        return comment.toObject();
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
            }
        }
    };
}
;