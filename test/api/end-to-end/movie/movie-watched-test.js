'use strict';
var chai = require('chai');

var q = require('q');


describe('Movie-Watched-Endpoint Tests', function () {

    var testConfig = require('../test-init');
    var User = require("../../../../models/user");
    var InaktiveUser = require("../../../../models/inaktive-user");
    var Movie = require("../../../../models/movie");
    var MovieWatched = require("../../../../models/movie-watched");
    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var exampleMovies = testFactory.exampleData.generateMovies();
    var apiTestUtil = testFactory.apiTestUtil();
    var apiEvaluation = testFactory.apiEvaluation();
    var errorEvaluation = testFactory.errorEvaluation();
    var userRepositoryTestUtil = testFactory.userTestUtil().repositoryDecorator;
    var api = apiTestUtil.apiDecorator;

    var toxicAvengerUnwatchedResult = null;
    var toxicAvengerWatchedResult = null;

    before(function (done) {
        exampleUsers = testFactory.exampleData.generateUsers();
        exampleMovies = testFactory.exampleData.generateMovies();
        apiTestUtil.setUpServer().then(function () {
            return q.all([
                User.remove(),
                InaktiveUser.remove(),
                Movie.remove(),
            ]);
        }).then(function () {
            return q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.adminBob, 'admin'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.moderatorBob, 'moderator'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.looserBob, 'looser')
            ]);
        }).then(function () {
            return q.all([
                api.postMovie(exampleUsers.adminBob, exampleMovies.theToxicAvenger),
                api.postMovie(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos)
            ]);
        }).then(function () {
            toxicAvengerWatchedResult = {
                movie: exampleMovies.theToxicAvenger._id,
                watched: {
                    value: true
                }
            };
            toxicAvengerUnwatchedResult = {
                movie: exampleMovies.theToxicAvenger._id,
                watched: {
                    value: false
                }
            };
            done();
        });

    });

    after(function (done) {
        q.all([
            User.remove(),
            InaktiveUser.remove(),
            Movie.remove(),
        ]).then(function () {
            return q.all([
                apiTestUtil.tearDownServer()
            ]);
        }).then(function () {
            done();
        });
    });

    beforeEach(function (done) {
        q.all([
            MovieWatched.remove()
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            MovieWatched.remove(),
        ]).then(function () {
            done();
        });
    });

    describe('PUT /movie/:movie_id/watched', function () {

        describe('authenticated', function () {

            it('should return 200 with movie-watched when setting movie watched', function (done) {
                api.putMovieWatched(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id).then(function (res) {
                    apiEvaluation.evaluateMovieWatchedResponse(res, 200, toxicAvengerWatchedResult);
                    done();
                });
            });

            it('should return 404 not-found-error when setting invalid movie watched', function (done) {
                api.putMovieWatched(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when setting movie watched', function (done) {
                api.putMovieWatched(exampleUsers.alice, exampleMovies.theToxicAvenger._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });


    describe('PUT /movie/:movie_id/unwatched', function () {

        beforeEach(function (done) {
            q.all([
                api.putMovieWatched(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id)
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movie-watched when setting movie unwatched', function (done) {
                api.putMovieUnwatched(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id).then(function (res) {
                    apiEvaluation.evaluateMovieWatchedResponse(res, 200, toxicAvengerUnwatchedResult);
                    done();
                });
            });

            it('should return 400 validation-error when setting unwatched movie unwatched', function (done) {
                api.putMovieUnwatched(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

            it('should return 404 not-found-error when setting invalid movie watched', function (done) {
                api.putMovieUnwatched(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when setting movie watched', function (done) {
                api.putMovieUnwatched(exampleUsers.alice, exampleMovies.theToxicAvenger._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('GET /movie/:movie_id/watched', function () {

        beforeEach(function (done) {
            q.all([
                api.putMovieWatched(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id)
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movie-watched when getting watched movie', function (done) {
                api.getMovieWatched(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id).then(function (res) {
                    apiEvaluation.evaluateMovieWatchedResponse(res, 200, toxicAvengerWatchedResult);
                    done();
                });
            });

            it('should return 200 with movie-unwatched when getting unwatched movie', function (done) {
                api.getMovieWatched(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos._id).then(function (res) {
                    var expected = {
                        movie: exampleMovies.returnOfTheKillerTomatos._id,
                        watched: {
                            value: false
                        }
                    };
                    apiEvaluation.evaluateMovieWatchedResponse(res, 200, expected);
                    done();
                });
            });

            it('should return 404 not-found-error when getting invalid movie', function (done) {
                api.getMovieWatched(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when setting movie watched', function (done) {
                api.getMovieWatched(exampleUsers.alice, exampleMovies.theToxicAvenger._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

});