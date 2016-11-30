'use strict';
var chai = require('chai');

var q = require('q');


describe('Movie-Endpoint Tests', function () {

    var testConfig = require('../test-init');
    var User = require("../../../../models/user");
    var InaktiveUser = require("../../../../models/inaktive-user");
    var Movie = require("../../../../models/movie");
    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var exampleMovies = testFactory.exampleData.generateMovies();
    var apiTestUtil = testFactory.apiTestUtil();
    var apiEvaluation = testFactory.apiEvaluation();
    var errorEvaluation = testFactory.errorEvaluation();
    var userRepositoryTestUtil = testFactory.userTestUtil().repositoryDecorator;
    var api = apiTestUtil.apiDecorator;

    before(function (done) {
        exampleUsers = testFactory.exampleData.generateUsers();
        apiTestUtil.setUpServer().then(function () {
            return q.all([
                User.remove(),
                InaktiveUser.remove()
            ]);
        }).then(function () {
            return q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.adminBob, 'admin'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.moderatorBob, 'moderator'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.looserBob, 'looser')
            ]);
        }).then(function () {
            done();
        });

    });

    after(function (done) {
        q.all([
            Movie.remove(),
            InaktiveUser.remove()
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
            Movie.remove(),
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            Movie.remove(),
        ]).then(function () {
            done();
        });
    });

    describe('POST /movie', function () {

        describe('authenticated', function () {

            it('should return 201 with movie when creating movie with valid movie-data as admin', function (done) {
                api.postMovie(exampleUsers.adminBob, exampleMovies.theToxicAvenger).then(function (res) {
                    apiEvaluation.evaluateMovieResponse(res, 201, exampleMovies.theToxicAvenger, exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 201 with movie when creating movie with valid movie-data as moderator', function (done) {
                api.postMovie(exampleUsers.moderatorBob, exampleMovies.theToxicAvenger).then(function (res) {
                    apiEvaluation.evaluateMovieResponse(res, 201, exampleMovies.theToxicAvenger, exampleUsers.moderatorBob);
                    done();
                });
            });

            it('should return 400 validation-error when creating two movies with the same title', function (done) {
                api.postMovie(exampleUsers.adminBob, exampleMovies.theToxicAvenger).then(function (res) {
                    return api.postMovie(exampleUsers.adminBob, exampleMovies.theToxicAvengerSame);
                }).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

            it('should return 400 validation-error when creating movie with invalid data', function (done) {
                api.postMovie(exampleUsers.adminBob, exampleMovies.theToxicAvengerInvalid).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

        });

        describe('not authorized', function () {

            it('should return 401 unauthorized when creating a movie', function (done) {
                api.postMovie(exampleUsers.bob, exampleMovies.theToxicAvenger).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when creating a movie', function (done) {
                api.postMovie(exampleUsers.alice, exampleMovies.theToxicAvenger).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('GET /movies', function () {

        beforeEach(function (done) {
            q.all([
                api.postMovie(exampleUsers.adminBob, exampleMovies.theToxicAvenger),
                api.postMovie(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movies when getting all movies as admin', function (done) {
                api.getMovies(exampleUsers.adminBob, {}).then(function (res) {
                    var expected = [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.returnOfTheKillerTomatos
                    ];
                    apiEvaluation.evaluateMoviesResponse(res, 200, expected);
                    done();
                });
            });

            it('should return 200 with users when getting with query', function (done) {
                api.getMovies(exampleUsers.adminBob, {title: 'toxic'}).then(function (res) {
                    var expected = [
                        exampleMovies.theToxicAvenger,
                    ];
                    apiEvaluation.evaluateMoviesResponse(res, 200, expected);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when getting all users', function (done) {
                api.getMovies(exampleUsers.alice, {}).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('GET /movies/:movie_id', function () {

        var id = null;

        beforeEach(function (done) {
            q.all([
                api.postMovie(exampleUsers.adminBob, exampleMovies.theToxicAvenger),
                api.postMovie(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                id = exampleMovies.theToxicAvenger._id;
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movie when getting the movie as admin', function (done) {
                api.getMovie(exampleUsers.adminBob, id).then(function (res) {
                    apiEvaluation.evaluateMovieResponse(res, 200, exampleMovies.theToxicAvenger, exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 404 not-found-error when updating movie with invalid movie_id', function (done) {
                api.getMovie(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when getting all users', function (done) {
                api.getMovie(exampleUsers.alice, id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('PUT /movie/:movie_id', function () {

        var id = null;

        beforeEach(function (done) {
            q.all([
                api.postMovie(exampleUsers.adminBob, exampleMovies.theToxicAvenger),
                api.postMovie(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                id = exampleMovies.theToxicAvenger._id;
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movie when updating movie with valid movie-data as admin', function (done) {
                api.putMovie(exampleUsers.adminBob, id, exampleMovies.theToxicAvengerUpdated).then(function (res) {
                    apiEvaluation.evaluateMovieResponse(res, 200, exampleMovies.theToxicAvengerUpdated, exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 200 with movie when updating movie with valid movie-data as moderator', function (done) {
                api.putMovie(exampleUsers.moderatorBob, id, exampleMovies.theToxicAvengerUpdated).then(function (res) {
                    apiEvaluation.evaluateMovieResponse(res, 200, exampleMovies.theToxicAvengerUpdated, exampleUsers.moderatorBob);
                    done();
                });
            });

            it('should return 400 validation-error when updating movie to invalid title', function (done) {
                api.putMovie(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos._id, exampleMovies.theToxicAvenger).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

            it('should return 404 not-found-error when updating movie with invalid movie_id', function (done) {
                api.putMovie(exampleUsers.adminBob, 123, exampleMovies.theToxicAvengerInvalid).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authorized', function () {

            it('should return 401 unauthorized when updating a movie', function (done) {
                api.putMovie(exampleUsers.bob, id, exampleMovies.theToxicAvenger).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when updating a movie', function (done) {
                api.putMovie(exampleUsers.alice, id, exampleMovies.theToxicAvenger).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('DELETE /movie/:movie_id', function () {

        var id = null;

        beforeEach(function (done) {
            q.all([
                api.postMovie(exampleUsers.adminBob, exampleMovies.theToxicAvenger),
                api.postMovie(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                id = exampleMovies.theToxicAvenger._id;
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movie when deleting movie as admin', function (done) {
                api.deleteMovie(exampleUsers.adminBob, id).then(function (res) {
                    apiEvaluation.evaluateMovieResponse(res, 200, exampleMovies.theToxicAvenger, exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 200 with movie when deleting movie as moderator', function (done) {
                api.deleteMovie(exampleUsers.moderatorBob, id).then(function (res) {
                    apiEvaluation.evaluateMovieResponse(res, 200, exampleMovies.theToxicAvenger, exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 404 not-found-error when deleting movie with invalid movie_id', function (done) {
                api.deleteMovie(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authorized', function () {

            it('should return 401 unauthorized when deleting a movie as looser', function (done) {
                api.deleteMovie(exampleUsers.looserBob, id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when updating a movie', function (done) {
                api.deleteMovie(exampleUsers.alice, id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

});