'use strict';

var User = require('../models/user');

function getUserResponseBody(user, message) {
    var result = {
        success: true,
        data: {
            user: user.toObject()
        }
    };
    if (message) {
        result.message = message;
    }
    return result;
}

module.exports.register = function create(req, res, next) {
    var user = new User(req.body);
    user.save(function (err) {
        if (err) {
            return next(err);
        }
        res.status(201);
        res.send(getUserResponseBody(user, 'User created!'));
    });
};

module.exports.changePassword = function (req, res, next) {
    User.findOne({_id: req.user._id}, function (err, user) {
        if (err) {
            return next(err);
        }
        var oldPassword = req.body.old_password;
        var newPassword = req.body.new_password;
        user.verifyPassword(oldPassword, function (err, isMatch) {
            if (err) {
                return next(err);
            }

            if (!isMatch) {
                return next({status: 400, message: 'Old password does not match!'});
            }

            user.password = newPassword;
            user.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.status(200);
                res.send(getUserResponseBody(user, 'Password changed!'));
            });
        });
    });
};

module.exports.getMe = function (req, res) {
    User.findOne({_id: req.user._id}, function (err, user) {
        if (err) {
            return next(err);
        }
        res.send(getUserResponseBody(user));
    });
};