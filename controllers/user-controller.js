'use strict';

var moongose = require('mongoose');

module.exports = function (UserRepository, authService) {

    return {
        register: function (req, res, next) {
            UserRepository.register(req.body).then(function (user) {
                res.status(201);
                res.sendData({user: user}, 'User registered! The Admin will activate your account as soon as possible!');
            }).catch(next);
        },
        getMe: function (req, res, next) {
            var currentUserId = authService.getCurrentUser()._id;
            UserRepository.getUserById(currentUserId).then(function (result) {
                res.status(200);
                res.sendData({user: result});
            }).catch(next);
        },
        activate: function (req, res, next) {
            UserRepository.activateById(req.params.inaktive_user_id).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'User activated!');
            }).catch(next);
        },
        update: function (req, res, next) {
            var currentUserId = authService.getCurrentUser()._id;
            UserRepository.updateById(currentUserId, req.body).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'User updated!');
            }).catch(next);
        },
        verifyPassword: function (req, res, next) {
            var currentUserId = authService.getCurrentUser()._id;
            UserRepository.verifyPasswordById(currentUserId, req.body.password).then(function (result) {
                var message = result.isMatch ? 'Password does match!' : 'Password does not match!';
                res.status(200);
                res.sendData(result, message);
            }).catch(next);
        },
        changePassword: function (req, res, next) {
            var currentUserId = authService.getCurrentUser()._id;
            UserRepository.changePasswordById(currentUserId, req.body.oldPassword, req.body.newPassword).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'User password changed!');
            }).catch(next);
        },
        setRole: function (req, res, next) {
            UserRepository.setRoleById(req.params.user_id, req.params.new_role_name).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'New Role set to "' + req.params.new_role_name + '"!');
            }).catch(next);
        },
        deleteUser: function (req, res, next) {
            UserRepository.deleteUserById(req.params.user_id).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'User deleted!');
            }).catch(next);
        },
        deleteInaktiveUser: function (req, res, next) {
            UserRepository.deleteInaktiveUserById(req.params.inaktive_user_id).then(function (user) {
                res.status(200);
                res.sendData({user: user}, 'User deleted!');
            }).catch(next);
        },
        getUsers: function (req, res, next) {
            UserRepository.getUsers(req.resourceOptions).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(next);
        },
        getInaktiveUsers: function (req, res, next) {
            UserRepository.getInaktiveUsers({query: req.query}).then(function (result) {
                res.status(200);
                res.sendData(result);
            }).catch(next);
        }
    }

}