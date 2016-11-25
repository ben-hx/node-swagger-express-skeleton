'use strict';

var jwt = require('jsonwebtoken');
var config = require('../config');

var TempUser = require('../models/inaktive-user');
var controllerUtil = require('./controller-util');

var verificationConfig = config[process.env.NODE_ENV].settings.user.verification;

function getUnregisteredUsersResponseBody(users, pagination) {
    var result = {
        success: true,
        data: {
            unregisteredUsers: users,
            pagination: pagination
        }
    };
    return result;
}

module.exports.activateUser = function create(req, res, next) {
    TempUser.findOne({_id: req.swagger.params.user_id.value}, function (err, user) {
        if (err) {
            return next(err);
        }
        var id = user._id;
        delete user._id;
        var newUser = new User(user);
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            TempUser.findOneAndRemove({_id: id}, function (err) {
                if (err) {
                    return next(err);
                }
                res.status(201);
                res.json(controllerUtil.getUserResponseBody(newUser, 'User activated!'));
            });
        });
    });
};

module.exports.getUnregisterdUsers = function create(req, res, next) {

    var paginationParams = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || config[req.app.get('env')].settings.user.activation.userPerPageDefault
    };

    var sort = req.query.sort || config[req.app.get('env')].settings.user.activation.SortDefault;

    TempUser.find()
        .skip(paginationParams.page * paginationParams.limit)
        .limit(paginationParams.limit)
        .sort(sort)
        .exec(function (err, users) {
            if (err) {
                return next(err);
            }
            var users = users.map(function (movie) {
                return movie.toObject();
            });
            TempUser.count({}, function (err, totalCount) {
                if (err) {
                    return next(err);
                }
                paginationParams.totalCount = totalCount;
                paginationParams.totalPages = Math.ceil(totalCount / paginationParams.limit);
                res.json(getMoviesResponseBody(users, paginationParams));
            });
        });
};