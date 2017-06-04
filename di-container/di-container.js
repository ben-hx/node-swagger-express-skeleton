'use strict';
var debug = require('debug')('app');

module.exports = function () {
    var config = require('../config')[process.env.NODE_ENV];
    var errors = require('../errors/errors');
    var User = require("../models/user");
    var InaktiveUser = require("../models/inaktive-user");
    var Movie = require("../models/movie");
    var MovieList = require("../models/movie-list");
    var Post = require("../models/post");

    var repositoryUtilInstance = require("../utils/repository-util")();
    var UserRepository = require("../repositories/user-repository")(errors, User, InaktiveUser);
    var MoviePropertyRepository = require("../repositories/movie-property-repository")(errors, Movie);
    var MovieRepository = require("../repositories/movie-repository")(config, errors, repositoryUtilInstance, UserRepository, Movie);
    var MovieListRepository = require("../repositories/movie-list-repository")(config, errors, repositoryUtilInstance, UserRepository, MovieList);
    var PostRepository = require("../repositories/post-repository")(config, errors, repositoryUtilInstance, UserRepository, Post);
    var authServiceInstance = require('../auth/auth-service')(errors, UserRepository).initialize();
    var userRepositoryInstance = require("../repositories/authorization-decorators/user-repository")(errors, UserRepository, authServiceInstance);
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
        getMovieListRepository: function () {
            var movieListRepository = MovieListRepository.forUser(authServiceInstance.getCurrentUser());
            var decorator = require("../repositories/authorization-decorators/movie-list-repository");
            return decorator(movieListRepository, authServiceInstance);
        },
        getPostRepository: function () {
            var postRepository = PostRepository.forUser(authServiceInstance.getCurrentUser());
            var decorator = require("../repositories/authorization-decorators/post-repository");
            return decorator(postRepository, authServiceInstance);
        },
        getBasicAuthentication: function () {
            return basicAuthenticationInstance;
        },
        getUserController: function () {
            return require("../controllers/user-controller")(this.getUserRepository(), this.getAuthService());
        },
        getMovieController: function () {
            return require("../controllers/movie-controller")();
        },
        getMovieListController: function () {
            return require("../controllers/movie-list-controller")();
        },
        getPostController: function () {
            return require("../controllers/post-controller")();
        }
    };
};
