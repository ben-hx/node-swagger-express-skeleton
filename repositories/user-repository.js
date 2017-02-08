'use strict';

var q = require('q');

module.exports = function (errors, User, InaktiveUser) {

    function findUserById(id) {
        return User.findOne({_id: id}).then(function (user) {
            if (user == null) {
                throw new errors.NotFoundError('User does not exist!');
            }
            return user;
        });
    }

    function findInaktiveUserById(id) {
        return InaktiveUser.findOne({_id: id}).then(function (user) {
            if (user == null) {
                throw new errors.NotFoundError('User does not exist!');
            }
            return user;
        });
    }

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
            user.saveWithHashedPassword().then(function (user) {
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
            findUserById(id).then(function (user) {
                user = Object.assign(user, data);
                return user.save();
            }).then(function (user) {
                return deferred.resolve(user.toObject());
            }).catch(function (error) {
                return deferred.reject(errors.convertError(error));
            });
            return deferred.promise;
        },

        verifyPasswordById: function (id, password) {
            var deferred = q.defer();
            findUserById(id).then(function (user) {
                return user.verifyPassword(password).then(function (isMatch) {
                    return {isMatch: isMatch, user: user.toObject()};
                });
            }).then(function (result) {
                return deferred.resolve(result);
            }).catch(function (error) {
                return deferred.reject(errors.convertError(error));
            });
            return deferred.promise;
        },

        changePasswordById: function (id, oldPassword, newPassword) {
            var deferred = q.defer();
            findUserById(id).then(function (user) {
                return user.verifyPassword(oldPassword).then(function (isMatch) {
                    if (!isMatch) {
                        throw new errors.ValidationError("Password does not match!");
                    }
                    return user;
                });
            }).then(function (user) {
                user.password = newPassword;
                return user.saveWithHashedPassword();
            }).then(function (user) {
                return deferred.resolve(user.toObject());
            }).catch(function (error) {
                return deferred.reject(errors.convertError(error));
            });
            return deferred.promise;
        },

        activateById: function (inaktiveUserId) {
            var deferred = q.defer();
            findInaktiveUserById(inaktiveUserId).then(function (inaktiveUser) {
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
            findUserById(userId).then(function (user) {
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
            findUserById(id).then(function (user) {
                return deferred.resolve(user.toObject());
            }).catch(function (error) {
                return deferred.reject(errors.convertError(error));
            });
            return deferred.promise;
        },

        deleteUserById: function (id) {
            var deferred = q.defer();
            findUserById(id).then(function (user) {
                return User.remove({_id: id}).exec().then(function () {
                    return deferred.resolve(user.toObject());
                });
            }).catch(function (error) {
                return deferred.reject(errors.convertError(error));
            });
            return deferred.promise;
        },

        deleteInaktiveUserById: function (id) {
            var deferred = q.defer();
            findInaktiveUserById(id).then(function (user) {
                return InaktiveUser.remove({_id: id}).exec().then(function () {
                    return deferred.resolve(user.toObject());
                });
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
                deferred.reject(error);
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
                deferred.reject(error);
            });
            return deferred.promise;
        }

    }
};