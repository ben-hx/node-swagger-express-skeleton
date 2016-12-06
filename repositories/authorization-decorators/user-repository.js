'use strict';

var q = require('q');

module.exports = function (userRepository, authorizationService) {

    return {
        register: userRepository.register,

        activateById: function (inaktiveUserId) {
            authorizationService.checkPermission(['admin']);
            return userRepository.activateById(inaktiveUserId);
        },

        create: function (data) {
            authorizationService.checkPermission(['admin']);
            return userRepository.create(data);
        },

        updateById: function (id, data) {
            authorizationService.checkPermission(['admin']);
            return userRepository.updateById(id, data);
        },

        setRoleById: function (userId, role) {
            authorizationService.checkPermission(['admin']);
            return userRepository.setRoleById(userId, role);
        },

        getMe: function () {
            return userRepository.getUserById(authorizationService.getCurrentUser()._id);
        },

        getUserById: function (id) {
            authorizationService.checkPermission(['admin']);
            return userRepository.getUserById(id);
        },

        getUsers: function (options) {
            authorizationService.checkPermission(['admin']);
            return userRepository.getUsers(options);
        },

        getInaktiveUsers: function (options) {
            authorizationService.checkPermission(['admin']);
            return userRepository.getInaktiveUsers(options);
        }
    }
};