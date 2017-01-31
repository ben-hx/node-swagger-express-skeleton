'use strict';

var debug = require('debug');
var config = require('../../../config')[process.env.NODE_ENV];
var errors = require("../../../errors/errors");
var mongooseConfig = require('../../../mongoose-config')(debug, config);

var AuthorizationService = require("../../../auth/auth-service")(errors);
var User = require("../../../models/user");
var InaktiveUser = require("../../../models/inaktive-user");
var UserRepository = require("../../../repositories/user-repository")(errors, User, InaktiveUser);
var Movie = require("../../../models/movie");
var MovieUserAction = require("../../../models/movie-user-action");
var MovieRepository = require("../../../repositories/movie-repository")(config, errors, UserRepository, Movie, MovieUserAction);


var apiTestUtilInstance = require('./api/api-test-util')(config, debug, require("../../../app")());

module.exports = function () {
    return {
        exampleData: {
            generateUsers: require('./user/example-users').generate,
            generateMovies: require('./movie/examle-movies').generate,
        },
        config: config,
        dbTestUtil: function () {
            return require('./db/db-test-util')(mongooseConfig);
        },
        apiTestUtil: function () {
            return apiTestUtilInstance;
        },
        apiEvaluation: function () {
            return require('./api/api-evaluation-util')();
        },
        errorEvaluation: function () {
            return require('./error/error-evaluation-util')(errors);
        },
        authTestUtil: function () {
            return require('./auth/auth-test-util')(AuthorizationService);
        },
        movieTestUtil: function () {
            return require('./movie/movie-test-util')(Movie, MovieUserAction, MovieRepository);
        },
        movieEvaluation: function () {
            return require('./movie/movie-evaluation-util')();
        },
        userTestUtil: function () {
            return require('./user/user-test-util')(User, UserRepository);
        },
        userEvaluation: function () {
            return require('./user/user-evaluation-util')();
        }
    }
};
