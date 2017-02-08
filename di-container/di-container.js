'use strict';
var debug = require('debug');

module.exports = function () {
    var config = require('../config')[process.env.NODE_ENV];
    var errors = require('../errors/errors');
    var User = require("../models/user");
    var InaktiveUser = require("../models/inaktive-user");
    var UserRepository = require("../repositories/user-repository")(errors, User, InaktiveUser);
    var Movie = require("../models/movie");
    var MovieUserAction = require("../models/movie-user-action");
    var MoviePropertyRepository = require("../repositories/movie-property-repository")(errors, Movie);
    var MovieRepository = require("../repositories/movie-repository")(config, errors, UserRepository, Movie, MovieUserAction);

    var authServiceInstance = require('../auth/auth-service')(errors, UserRepository).initialize();
    var userRepositoryInstance = require("../repositories/authorization-decorators/user-repository")(UserRepository, authServiceInstance);

    //var movieRepositoryInstance = require("../repositories/authorization-decorators/movie-repository")(MovieRepository, authServiceInstance);


    var moviePropertyRepositoryInstance = require("../repositories/authorization-decorators/movie-property-repository")(MoviePropertyRepository, authServiceInstance);
    var basicAuthenticationInstance = require("../auth/basic-authentication")(authServiceInstance);

    var mongooseConfig = require('../mongoose-config')(debug, config);

    return {
        initialize: function () {
            return mongooseConfig.initialize();
        },
        getConfig: function () {
            return config;
        },
        getAuthService: function () {
            return authServiceInstance;
        },
        getUserRepository: function () {
            return userRepositoryInstance;
        },
        getMovieRepository: function () {
            var movieRepository = MovieRepository.forUser(authServiceInstance.getCurrentUser());
            var decorator = require("../repositories/authorization-decorators/movie-repository");
            return decorator(movieRepository, authServiceInstance);
        },
        getMovieProperteyRepository: function () {
            return moviePropertyRepositoryInstance
        },
        getBasicAuthentication: function () {
            return basicAuthenticationInstance;
        },
        getUserController: function () {
            return require("../controllers/user-controller")(this.getUserRepository(), this.getAuthService());
        },
        getMovieController: function () {
            return require("../controllers/movie-controller")();
        }
    };
};
