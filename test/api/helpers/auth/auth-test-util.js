var mongoose = require("mongoose");

module.exports = function (AuthorizationService) {
    var possibleRoles = ['admin', 'moderator', 'looser'];

    return {
        authorizationService: AuthorizationService,
        authorizationServiceForUserWitRole: function (role) {
            var user = {
                _id: mongoose.Types.ObjectId('56cb91bdc3464f14678934ca'),
                role: role
            };
            return AuthorizationService.forUser(user);
        },
        allPossibleRoles: function () {
            return possibleRoles;
        },
        allPossibleRolesExcept: function (exceptedRoles) {
            var result = [];
            possibleRoles.forEach(function (role) {
                if (exceptedRoles.indexOf(role) < 0) {
                    result.push(role);
                }
            });
            return result;
        }
    }
};
