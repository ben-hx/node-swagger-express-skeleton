'use strict';

var q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (config, errors, repositoryUtil, UserRepository, MovieList) {

    var populationFields = 'createdUser movies.movie editableUsers.user comments.user';

    return {
        forUser: function (user) {
            checkUserExistance(user);

            function checkUserExistance(user) {
                return UserRepository.getUserById(user._id);
            }

            function findMovieById(movieListId, movie) {
                return MovieList.findOne({_id: movieListId})
                    .where('movies.movie', movie)
                    .select({'movies.$': 1});
            }

            function findEditableUserById(movieListId, user) {
                return MovieList.findOne({_id: movieListId})
                    .where('editableUsers.user', user)
                    .select({'editableUsers.$': 1});
            }

            function userHasPermissionToEdit(movieList) {
                var deferred = q.defer();
                var userIsCreator = user._id.equals(movieList.createdUser._id);
                if (userIsCreator) {
                    deferred.resolve(true);
                }
                findEditableUserById(movieList._id, user._id).then(function (result) {
                    var userIsInEditableList = result != null;
                    deferred.resolve(userIsInEditableList);
                }).catch(function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }


            function findById(id) {
                var query = {
                    $and: [
                        {_id: id},
                        {
                            $or: [{
                                createdUser: user
                            }, {
                                access: 'public'
                            }, {
                                access: 'group',
                                editableUsers: {$elemMatch: {user: user}}
                            }]
                        }]
                };
                return MovieList.findOne(query).populate(populationFields).then(function (result) {
                    if (result == null) {
                        throw new errors.NotFoundError('MovieList does not exist!');
                    }
                    return result;
                });
            }

            function toResponse(list) {
                return list.toObject();
            }

            return {
                create: function (movieListData) {
                    var self = this;
                    var deferred = q.defer();
                    movieListData.createdUser = user._id;
                    var list = new MovieList(movieListData);
                    list.save().then(function (result) {
                        return MovieList.populate(result, populationFields);
                    }).then(function (result) {
                        deferred.resolve(toResponse(result));
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                getAll: function (options) {
                    options = options || {};
                    var self = this;
                    var deferred = q.defer();
                    var userQuery = options.query || {};
                    userQuery = {
                        _id: {$ne: null},
                        title: repositoryUtil.castQueryParamByBeginning(userQuery.title),
                        description: repositoryUtil.castQueryParamByBeginning(userQuery.description),
                        tags: repositoryUtil.castQueryParamByOptionalArray(userQuery.tags),
                        created: repositoryUtil.castQueryParamByOptionalDateRange(userQuery.createdFrom, userQuery.createdTo),
                        access: repositoryUtil.castQueryParamByOptionalArray(userQuery.access)
                    };
                    userQuery = repositoryUtil.removeUndefinedPropertiesOfObject(userQuery);
                    options = {
                        query: {
                            $and: [{
                                $or: [{
                                    $and: [{
                                        createdUser: user
                                    }, userQuery]
                                }, {
                                    $and: [{
                                        access: 'public'
                                    }, userQuery]
                                }, {
                                    $and: [{
                                        access: 'group',
                                        editableUsers: {$elemMatch: {user: user}}
                                    }, userQuery]
                                }]
                            }]
                        },
                        sort: options.sort || config.settings.movie.moviesSortDefault,
                        page: parseInt(options.page) || 0,
                        limit: parseInt(options.limit) || config.settings.movie.moviesPerPageDefault,
                        populate: {
                            path: populationFields
                        }
                    };
                    MovieList.paginate(options).then(function (result) {
                        var docs = result.docs.reduce(function (docs, movieList) {
                            docs.push(toResponse(movieList));
                            return docs;
                        }, []);
                        deferred.resolve({movieLists: docs, pagination: result.pagination});
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                getById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    findById(id).then(function (result) {
                        return deferred.resolve(toResponse(result));
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                updateById: function (id, data) {
                    var self = this;
                    var deferred = q.defer();
                    delete data._id;
                    delete data.comments;
                    delete data.createdUser;
                    findById(id).then(function (movieList) {
                        var userIsCreator = user._id.equals(movieList.createdUser._id);
                        return userHasPermissionToEdit(movieList).then(function (userHasPermission) {
                            if (!userHasPermission) {
                                throw new errors.AuthenticationError('Not allowed to update the movie-list!');
                            }

                            var userIsInEditableUserArray = function (editableUsers) {
                                var result = false;
                                editableUsers.forEach(function (element) {
                                    if (user._id.equals(element.user._id)) {
                                        result = true;
                                    }
                                });
                                return result;
                            };

                            if (!userIsCreator && data.editableUsers && !userIsInEditableUserArray(data.editableUsers)) {
                                throw new errors.ValidationError('Not allowed to delete current User!');
                            }
                            return movieList;
                        });
                    }).then(function (movieList) {
                        movieList = Object.assign(movieList, data);
                        return movieList.save();
                    }).then(function (movieList) {
                        return self.getById(id);
                    }).then(function (result) {
                        return deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                deleteById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    findById(id).then(function (movieList) {
                        return userHasPermissionToEdit(movieList).then(function (result) {
                            if (!result) {
                                throw new errors.AuthenticationError('Not allowed to delete Movie!');
                            }
                            return movieList;
                        });
                    }).then(function (result) {
                        return result.remove().then(function () {
                            return result;
                        });
                    }).then(function (result) {
                        return deferred.resolve(toResponse(result));
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                addCommentById: function (id, text) {
                    var self = this;
                    var deferred = q.defer();
                    findById(id).then(function (result) {
                        result.comments.push({user: user, text: text});
                        return result.save();
                    }).then(function (result) {
                        return self.getById(id);
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                deleteCommentById: function (id, commentId) {
                    var self = this;
                    var deferred = q.defer();
                    findById(id).then(function (result) {
                        var comment = result.comments.id(commentId);
                        if (comment == null) {
                            throw new errors.NotFoundError('Comment not found!');
                        }
                        if (comment.user == null) {
                            throw new errors.ValidationError('User of Comment not found!');
                        }
                        if (!comment.user._id.equals(user._id)) {
                            throw new errors.AuthenticationError('User is not allowed to delete the Comment');
                        }
                        result.comments.pull(commentId);
                        return result.save();
                    }).then(function (result) {
                        return self.getById(id);
                    }).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                getCommentById: function (id, commentId) {
                    var self = this;
                    var deferred = q.defer();
                    findById(id).then(function (result) {
                        var comment = result.comments.id(commentId);
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
};