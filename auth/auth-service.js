'use strict';
var q = require('q');

module.exports = function (errors, UserRepository) {
    return {
        forUser: function (currentUser) {
            if (!currentUser || !currentUser._id) {
                throw new errors.IllegalArgumentError("User is not set");
            }
            return {
                getCurrentUser: function () {
                    return currentUser;
                },
                checkPermission: function (roles) {
                    if (roles && roles.length > 0 && roles.indexOf(currentUser.role) < 0) {
                        throw new errors.AuthenticationError("User does not have the Permission");
                    }
                    return true;
                }
            }
        },

        initialize: function () {

            var currentUser = null;

            return {
                authenticate: function (credentials) {
                    if (!credentials || !credentials.emailOrUsername || !credentials.password) {
                        throw new Error("Passed wrong credentials!");
                    }
                    var deferred = q.defer();
                    var self = this;
                    var query = {$or: [{'email': credentials.emailOrUsername}, {'username': credentials.emailOrUsername}]};
                    UserRepository.getUsers({query: query}).then(function (result) {
                        if (result == null || result.users.length == 0) {
                            throw new Error("User not found!");
                        }
                        var user = result.users[0];
                        return user.verifyPassword(credentials.password).then(function (isMatch) {
                            if (!isMatch) {
                                throw new Error("Password does not match!");
                            }
                            return user;
                        });
                    }).then(function (user) {
                        currentUser = user;
                        deferred.resolve(user);
                    }).catch(function (error) {
                        deferred.reject(new errors.AuthenticationError(error.message));
                    });
                    return deferred.promise;
                },
                getCurrentUser: function () {
                    return currentUser;
                },
                checkPermission: function (roles) {
                    if (!currentUser) {
                        throw new errors.AuthenticationError("Current User is not defined!");
                    }
                    if (roles && roles.length > 0 && roles.indexOf(currentUser.role) < 0) {
                        throw new errors.AuthenticationError("User does not have the Permission");
                    }
                    return true;
                }
            }
        }
    };
};