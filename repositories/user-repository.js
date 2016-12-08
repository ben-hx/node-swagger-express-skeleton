'use strict';

var q = require('q');

module.exports = function (errors, User, InaktiveUser) {

    return {

        register: function (data) {
            var deferred = q.defer();
            var user = new InaktiveUser(data);
            user.save().then(function (user) {
                return deferred.resolve(user.toObject());
            }).catch(function (error) {
                return deferred.reject(new errors.ValidationError(error));
            });
            return deferred.promise;
        },

        create: function (data) {
            var deferred = q.defer();
            var user = new User(data);
            user.save().then(function (user) {
                return deferred.resolve(user.toObject());
            }).catch(function (error) {
                return deferred.reject(new errors.ValidationError(error));
            });
            return deferred.promise;
        },

        updateById: function (id, data) {
            var deferred = q.defer();
            delete data._id;
            delete data.password;
            User.findOne({_id: id}).then(function (user) {
                if (user == null) {
                    throw new errors.NotFoundError('User does not exist!');
                }
                user = Object.assign(user, data);
                return user.save();
            }).then(function (user) {
                return deferred.resolve(user.toObject());
            }).catch(function (error) {
                return deferred.reject(errors.convertError(error));
            });
            return deferred.promise;
        },

        activateById: function (inaktiveUserId) {
            var deferred = q.defer();
            InaktiveUser.findOne({_id: inaktiveUserId}).then(function (inaktiveUser) {
                if (inaktiveUser == null) {
                    throw new errors.NotFoundError('User does not exist!');
                }
                return inaktiveUser.remove();
            }).then(function (inaktiveUser) {
                var password = inaktiveUser.password;
                var data = inaktiveUser.toObject();
                delete data._id;
                data.role = 'looser';
                data.password = password;
                var newUser = new User(data);
                return newUser.save();
            }).then(function (user) {
                return deferred.resolve(user.toObject());
            }).catch(function (error) {
                if (error.name == 'CastError') {
                    return deferred.reject(new errors.NotFoundError('User does not exist!'));
                }
                if (!(error instanceof errors.NotFoundError)) {
                    return deferred.reject(new errors.ReadError('Error while reading User from Database'));
                }
                return deferred.reject(error);
            });
            return deferred.promise;
        },

        setRoleById: function (userId, role) {
            var deferred = q.defer();
            User.findOne({_id: userId}).then(function (user) {
                if (user == null) {
                    throw new errors.NotFoundError('User does not exist!');
                }
                user.role = role;
                return user.save();
            }).then(function (user) {
                deferred.resolve(user.toObject());
            }).catch(function (error) {
                if (error.name == 'CastError') {
                    return deferred.reject(new errors.NotFoundError('User does not exist!'));
                }
                if (error.name == 'ValidationError') {
                    return deferred.reject(new errors.ValidationError(error));
                }
                if (!(error instanceof errors.NotFoundError)) {
                    return deferred.reject(new errors.ReadError('Error while reading User from Database'));
                }
                return deferred.reject(error);
            });
            return deferred.promise;
        },

        getUserById: function (id) {
            var deferred = q.defer();
            User.findOne({_id: id}).then(function (user) {
                if (user == null) {
                    throw new errors.NotFoundError('User does not exist!');
                } else {
                    return deferred.resolve(user.toObject());
                }
            }).catch(function (error) {
                return deferred.reject(errors.convertError(error));
            });
            return deferred.promise;
        },

        getUsers: function (options) {
            var deferred = q.defer();
            User.paginate(options).then(function (result) {
                var docs = result.docs.map(function (user) {
                    return user.toObject();
                });
                deferred.resolve({users: docs, pagination: result.pagination});
            }).catch(function (error) {
                deferred.reject(err);
            });
            return deferred.promise;
        },

        getInaktiveUsers: function (options) {
            var deferred = q.defer();
            InaktiveUser.paginate(options).then(function (result) {
                var docs = result.docs.map(function (user) {
                    return user.toObject();
                });
                deferred.resolve({users: docs, pagination: result.pagination});
            }).catch(function (error) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

    }
};