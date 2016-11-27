var debug = require('debug');
var config = require('../../../config');
var errors = require("../../../errors/errors");
var mongooseConfig = require('../../../mongoose-config')(debug, config);

var AuthorizationService = require("../../../auth/authoriszation-service")(errors);
var User = require("../../../models/user");
var InaktiveUser = require("../../../models/inaktive-user");
var UserRepository = require("../../../repositories/user-repository")(config, errors, User, InaktiveUser);
var Movie = require("../../../models/movie");
var MovieRating = require("../../../models/movie-rating");
var MovieWatched = require("../../../models/movie-watched");
var MovieRepository = require("../../../repositories/movie-repository")(config, errors, Movie, MovieRating, MovieWatched);

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
        errorEvaluation: function () {
            return require('./error/error-evaluation-util')(errors);
        },
        authTestUtil: function () {
            return require('./auth/auth-test-util')(AuthorizationService);
        },
        movieTestUtil: function () {
            return require('./movie/movie-test-util')(Movie, MovieWatched, MovieRating, MovieRepository);
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
