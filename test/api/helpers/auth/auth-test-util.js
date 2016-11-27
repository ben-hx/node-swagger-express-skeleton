module.exports = function (AuthorizationService) {
    var possibleRoles = ['admin', 'moderator', 'looser'];

    return {
        authorizationService: AuthorizationService,
        authorizationServiceForUserWitRole: function (role) {
            var user = {
                _id: 'someId',
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
