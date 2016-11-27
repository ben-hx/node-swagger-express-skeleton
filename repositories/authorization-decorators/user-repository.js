'use strict';

var q = require('q');

module.exports = function (userRepository, authorizationService) {

    return {
        register: userRepository.register,

        activate: function (user) {
            authorizationService.checkPermission(['admin']);
            return userRepository.activate(user);
        },

        setRole: function (user, role) {
            authorizationService.checkPermission(['admin']);
            return userRepository.setRole(user, role);
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