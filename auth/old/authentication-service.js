var passport = require('passport');
var errors = require('../../errors/errors');
var BasicStrategy = require('/basic-authentication-strategy');

module.exports.getOptions = function () {
    return {
        user_auth: function (req, authOrSecDef, scopesOrApiKey, callback) {
            passport.use(new BasicStrategy());
            passport.authenticate('basic', {session: false}, function (err, user, info) {
                if (err) {
                    return callback(new errors.AuthenticationError('Error while auth'));
                }
                if (!user) {
                    return callback(new errors.AuthenticationError('User validation Failed'));
                }
                req.user = user;
                return callback();
            })(req, null, callback);
        }
    };
};