'use strict';

var q = require('q');

module.exports = function (config, errors, User, InaktiveUser) {

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

        activate: function (user) {
            var deferred = q.defer();
            InaktiveUser.findOne({_id: user._id}).then(function (tempUser) {
                if (tempUser == null) {
                    throw new errors.NotFoundError('User does not exist!');
                }
                return tempUser.remove();
            }).then(function (tempUser) {
                var password = tempUser.password;
                var data = tempUser.toObject();
                delete data._id;
                data.role = 'looser';
                data.password = password;
                var newUser = new User(data);
                return newUser.save();
            }).then(function (user) {
                return deferred.resolve(user.toObject());
            }).catch(function (error) {
                if (!(error instanceof errors.NotFoundError)) {
                    return deferred.reject(new errors.ReadError('Error while reading User from Database'));
                }
                return deferred.reject(error);
            });
            return deferred.promise;
        },

        setRole: function (user, role) {
            var deferred = q.defer();
            User.findOne({_id: user._id}).then(function (user) {
                if (user == null) {
                    throw new errors.NotFoundError('User does not exist!');
                }
                user.role = role;
                return user.save();
            }).then(function (user) {
                deferred.resolve(user.toObject());
            }).catch(function (error) {
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

        getUsers: function (options) {
            var deferred = q.defer();
            User.paginate(options).then(function (result) {
                deferred.resolve({users: result.docs, pagination: result.pagination});
            }).catch(function (error) {
                deferred.reject(err);
            });
            return deferred.promise;
        },

        getInaktiveUsers: function (options) {
            var deferred = q.defer();
            InaktiveUser.paginate(options).then(function (result) {
                deferred.resolve({users: result.docs, pagination: result.pagination});
            }).catch(function (error) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

    }
};