'use strict';

var moongose = require('mongoose');

module.exports = function (UserRepository, authService) {

    return {
        register: function (req, res, next) {
            UserRepository.register(req.body).then(function (user) {
                res.status(201);
                res.sendData({user: user}, 'User registered! The Admin will activate your account as soon as possible!');
            }).catch(function (error) {
                next(error);
            });
        },
        getMe: function (req, res, next) {
            var currentUserId = authService.getCurrentUser()._id;
            UserRepository.getUserById(currentUserId).then(function (result) {
                res.status(200);
                res.sendData({user: result});
            }).catch(function (error) {
                next(error);
            });
        },
        activate: function (req, res, next) {
            UserRepository.activateById(req.params.inaktive_user_id).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'User activated!');
            }).catch(function (error) {
                next(error);
            });
        },
        verifyPassword: function (req, res, next) {
            var currentUserId = authService.getCurrentUser()._id;
            UserRepository.verifyPasswordById(currentUserId, req.body.password).then(function (result) {
                var message = result.isMatch ? 'Password does match!' : 'Password does not match!';
                res.status(200);
                res.sendData(result, message);
            }).catch(function (error) {
                next(error);
            });
        },
        changePassword: function (req, res, next) {
            var currentUserId = authService.getCurrentUser()._id;
            UserRepository.changePasswordById(currentUserId, req.body.oldPassword, req.body.newPassword).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'User password changed!');
            }).catch(function (error) {
                next(error);
            });
        },
        setRole: function (req, res, next) {
            UserRepository.setRoleById(req.params.user_id, req.params.new_role_name).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'New Role set to "' + req.params.new_role_name + '"!');
            }).catch(function (error) {
                next(error);
            });
        },
        deleteUser: function (req, res, next) {
            UserRepository.deleteUserById(req.params.user_id).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'User deleted!');
            }).catch(function (error) {
                next(error);
            });
        },
        deleteInaktiveUser: function (req, res, next) {
            UserRepository.deleteInaktiveUserById(req.params.inaktive_user_id).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'User deleted!');
            }).catch(function (error) {
                next(error);
            });
        },
        getUsers: function (req, res, next) {
            UserRepository.getUsers(req.resourceOptions).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        },
        getInaktiveUsers: function (req, res, next) {
            UserRepository.getInaktiveUsers({query: req.query}).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(function (error) {
                next(error);
            });
        }
    }

}