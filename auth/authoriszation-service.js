'use strict';

module.exports = function (errors) {
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
        }
    };
};