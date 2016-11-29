'use strict';

module.exports = function (router, diContainer) {

    var basicAuth = diContainer.getBasicAuthentication().middleware;

    var register = router.route('/register');
    register.post(diContainer.getUserController().register);

    var activate = router.route('/users/:inaktive_user_id/activate');
    activate.post(basicAuth, diContainer.getUserController().activate);

    var setRole = router.route('/users/:user_id/role/:new_role_name');
    setRole.post(basicAuth, diContainer.getUserController().setRole);

    var users = router.route('/users');
    users.get(basicAuth, diContainer.getUserController().getUsers);

    var inaktiveUsers = router.route('/inaktive_users');
    inaktiveUsers.get(basicAuth, diContainer.getUserController().getInaktiveUsers);

    return router;
};
