var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

module.exports = function (AuthService) {

    var strategy = new BasicStrategy(
        function (emailOrUsername, password, callback) {
            AuthService.authenticate({emailOrUsername: emailOrUsername, password: password}).then(function (user) {
                return callback(null, user);
            }).catch(function (error) {
                return callback(error);
            });
        }
    );

    passport.use(strategy);

    return {
        strategy: strategy,
        middleware: passport.authenticate('basic', {session: false, failWithError: true})
    }
}