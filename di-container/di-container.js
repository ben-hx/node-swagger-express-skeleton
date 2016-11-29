'use strict';

module.exports = function (debug, config) {
    var errors = require('../errors/errors');
    var User = require("../models/user");
    var InaktiveUser = require("../models/inaktive-user");
    var UserRepository = require("../repositories/user-repository")(config, errors, User, InaktiveUser);
    var Movie = require("../models/movie");
    var MovieRating = require("../models/movie-rating");
    var MovieWatched = require("../models/movie-watched");
    var MovieRepository = require("../repositories/movie-repository")(config, errors, Movie, MovieRating, MovieWatched);
    var MoviePropertyRepository = require("../repositories/movie-property-repository")(config, errors, Movie);

    var authServiceInstance = require('../auth/auth-service')(errors, UserRepository).initialize();
    var userRepositoryInstance = require("../repositories/authorization-decorators/user-repository")(UserRepository, authServiceInstance);
    var movieRepositoryInstance = require("../repositories/authorization-decorators/movie-repository")(MovieRepository, authServiceInstance);
    var moviePropertyRepositoryInstance = require("../repositories/authorization-decorators/movie-property-repository")(MoviePropertyRepository, authServiceInstance);
    var basicAuthenticationInstance = require("../auth/basic-authentication")(authServiceInstance);

    return {
        getAuthService: function () {
            return authServiceInstance;
        },
        getUserRepository: function () {
            return userRepositoryInstance;
        },
        getMovieRepository: function () {
            return movieRepositoryInstance;
        },
        getMovieProperteyRepository: function () {
            return moviePropertyRepositoryInstance
        },
        getBasicAuthentication: function () {
            return basicAuthenticationInstance;
        },
        getUserController: function () {
            return require("../controllers/user-controller")(this.getUserRepository());
        }
    };
}
