'use strict';

var TempUser = require('../../models/inaktive-user');

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
    delete req.body.role;
    var user = new TempUser(req.body);
    user.save(function (err) {
        if (err) {
            return next(err);
        }
        res.status(201);
        res.send(getUserResponseBody(user, 'User registered! You have received an email to verify your account!'));
    });
};
