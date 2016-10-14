'use strict';

var User = require('../models/user');

function getPublicUserData(user) {
    user.__v = undefined;
    user.password = undefined;
    return user;
}

module.exports.registerUser = function create(req, res, next) {
    var user = new User(req.body);
    user.save(function (err) {
        if (err) {
            next(err);
            return;
        }
        res.status(201);
        res.send({success: true, message: 'User created!', data: getPublicUserData(user)});
    });
};


module.exports.loginUser = function login(req, res, next) {
    res.status(200);
    //User.login(req.swagger.params, res, next);
    res.json({success: true, message: 'User logged in!'});
};
