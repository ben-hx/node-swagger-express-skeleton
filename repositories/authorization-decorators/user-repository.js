'use strict';

var q = require('q');

module.exports = function (userRepository, authorizationService) {

    return {
        register: userRepository.register,

        create: function (data) {
            authorizationService.checkPermission(['admin']);
            return userRepository.create(data);
        },

        updateById: function (id, data) {
            authorizationService.checkPermission(['admin']);
            return userRepository.updateById(id, data);
        },

        verifyPasswordById: function (id, password) {
            return userRepository.verifyPasswordById(id, password);
        },

        changePasswordById: function (id, oldPassword, newPassword) {
            return userRepository.changePasswordById(id, oldPassword, newPassword);
        },

        activateById: function (inaktiveUserId) {
            authorizationService.checkPermission(['admin']);
            return userRepository.activateById(inaktiveUserId);
        },

        setRoleById: function (id, role) {
            authorizationService.checkPermission(['admin']);
            return userRepository.setRoleById(id, role);
        },

        deleteUserById: function (id) {
            authorizationService.checkPermission(['admin']);
            return userRepository.deleteUserById(id);
        },

        deleteInaktiveUserById: function (id) {
            authorizationService.checkPermission(['admin']);
            return userRepository.deleteInaktiveUserById(id);
        },

        getUserById: function (id) {
            return userRepository.getUserById(id);
        },

        getUsers: function (options) {
            return userRepository.getUsers(options);
        },

        getInaktiveUsers: function (options) {
            authorizationService.checkPermission(['admin']);
            return userRepository.getInaktiveUsers(options);
        }
    }
};