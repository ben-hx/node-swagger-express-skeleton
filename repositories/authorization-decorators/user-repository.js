'use strict';

var q = require('q');

module.exports = function (userRepository, authorizationService) {

    return {
        register: userRepository.register,

        activateById: function (inaktiveUserId) {
            authorizationService.checkPermission(['admin']);
            return userRepository.activateById(inaktiveUserId);
        },

        setRoleById: function (userId, role) {
            authorizationService.checkPermission(['admin']);
            return userRepository.setRoleById(userId, role);
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