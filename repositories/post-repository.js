'use strict';

var q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (config, errors, repositoryUtil, UserRepository, Post) {

    var populationFields = 'createdUser comments.user';

    return {
        forUser: function (user) {
            checkUserExistance(user);

            function checkUserExistance(user) {
                return UserRepository.getUserById(user._id);
            }

            function findById(id) {
                return MovieList.findOne({_id: id}).populate(populationFields).then(function (result) {
                    if (result == null) {
                        throw new errors.NotFoundError('MovieList does not exist!');
                    }
                    return result;
                });
            }

            function toResponse(post) {
                return post.toObject();
            }

            return {
                create: function (postData) {
                    var self = this;
                    var deferred = q.defer();
                    postData.createdUser = user._id;
                    var post = new Post(postData);
                    post.save().then(function (result) {
                        return Post.populate(result, populationFields);
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
                    var query = options.query || {};
                    options = {
                        query: {
                            _id: {$ne: null},
                            title: repositoryUtil.castQueryParamByBeginning(query.title),
                            description: repositoryUtil.castQueryParamByBeginning(query.description),
                            tags: repositoryUtil.castQueryParamByOptionalArray(query.tags),
                            created: repositoryUtil.castQueryParamByOptionalDateRange(query.createdFrom, query.createdTo)
                        },
                        sort: options.sort || config.settings.movie.moviesSortDefault,
                        page: parseInt(options.page) || 0,
                        limit: parseInt(options.limit) || config.settings.movie.moviesPerPageDefault,
                        populate: {
                            path: populationFields
                        }
                    };
                    Post.paginate(options).then(function (result) {
                        var docs = result.docs.reduce(function (docs, post) {
                            docs.push(toResponse(post));
                            return docs;
                        }, []);
                        deferred.resolve({posts: docs, pagination: result.pagination});
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
                    findById(id).then(function (post) {
                        var result = Object.assign(post, data);
                        return result.save();
                    }).then(function () {
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
                    findById(id).then(function (post) {
                        return post.remove().then(function () {
                            return post;
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