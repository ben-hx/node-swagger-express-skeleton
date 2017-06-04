'use strict';

var q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (config, errors, repositoryUtil, UserRepository, Notification) {

    var populationFields = 'createdUser';

    return {
        forUser: function (user) {
            checkUserExistance(user);

            function checkUserExistance(user) {
                return UserRepository.getUserById(user._id);
            }

            function findById(id) {
                return Notification.findOne({_id: id}).populate(populationFields).then(function (result) {
                    if (result == null) {
                        throw new errors.NotFoundError('Notification does not exist!');
                    }
                    return result;
                });
            }

            function toResponse(object) {
                return object.toObject();
            }

            return {
                create: function (data) {
                    var self = this;
                    var deferred = q.defer();
                    data.createdUser = user._id;
                    var notification = new Notification(data);
                    notification.save().then(function (result) {
                        return Notification.populate(result, populationFields);
                    }).then(function (result) {
                        deferred.resolve(toResponse(result));
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                },
                getAll: function (options) {
                    var self = this;
                    var deferred = q.defer();
                    Notification.paginate(options).then(function (result) {
                        var docs = result.docs.reduce(function (docs, result) {
                            docs.push(toResponse(result));
                            return docs;
                        }, []);
                        deferred.resolve({notifications: docs, pagination: result.pagination});
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
                deleteById: function (id) {
                    var self = this;
                    var deferred = q.defer();
                    findById(id).then(function (result) {
                        return result.remove().then(function () {
                            return result;
                        });
                    }).then(function (result) {
                        return deferred.resolve(toResponse(result));
                    }).catch(function (error) {
                        deferred.reject(errors.convertError(error));
                    });
                    return deferred.promise;
                }
            }
        }
    };
};