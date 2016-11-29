var User = require('../models/user');
var BasicStrategy = require('passport-http').BasicStrategy;
var errors = require('../errors/errors');

module.exports = function () {
    return new BasicStrategy(
        function (email, password, callback) {
            User.findOne({email: email}, function (err, user) {
                if (err) {
                    return callback(err);
                }

                if (!user) {
                    return callback(null, false);
                }

                user.verifyPassword(password, function (err, isMatch) {
                    if (err) {
                        return callback(err);
                    }

                    if (!isMatch) {
                        return callback(null, false);
                    }

                    return callback(null, user);
                });
            });
        }
    );
}