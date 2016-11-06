'use strict';
var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/user");
var Movie = require("../../../../models/movie");
var MovieWatched = require("../../../../models/movie-watched");
var testUtil = require("../helpers/test-util");
var exampleUsers = require("../helpers/exampleUsers");
var exampleMovies = require("../helpers/examleMovies");


describe('Movie-Watched-Endpoint Tests', function () {

    var dropForEach = [
        MovieWatched
    ];

    var dropForAll = [
        Movie,
        User
    ];

    before(function (done) {
        var registerUsers = [
            exampleUsers.bob,
            exampleUsers.alice,
            exampleUsers.eve
        ];
        var postMovies = [
            {user: exampleUsers.bob, movie: exampleMovies.theToxicAvenger},
            {user: exampleUsers.bob, movie: exampleMovies.returnOfTheKillerTomatos}
        ];
        testUtil.dropModels(dropForAll, function () {
            testUtil.registerExampleUsers(registerUsers, function () {
                testUtil.postExampleMovies(postMovies, function () {
                    done();
                });
            });
        });
    });

    beforeEach(function (done) {
        testUtil.dropModels(dropForEach, done);
    });

    afterEach(function (done) {
        testUtil.dropModels(dropForEach, done);
    });

    after(function (done) {
        testUtil.dropModels(dropForAll, done);
    });

    describe('PUT /movies/:movie_id/watched', function () {

        describe('logged in', function () {

            it('should return movie watched when setting the movie watched', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                        movieId: exampleMovies.theToxicAvenger._id,
                        watched: true
                    });
                    done();
                });
            });

            it('should return movie watched when setting the movie watched a secound time', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: exampleMovies.theToxicAvenger._id,
                            watched: true
                        });
                        done();
                    });
                });
            });

            it('should return a not-found-error when setting watched with invalid move_id', function (done) {
                var id = 123;
                testUtil.putExampleMovieWatched(exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });
        });

        describe('not logged in', function () {
            it('should return unauthorized when setting the movie watched with unposted user', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.unpostedUser, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

    describe('PUT /movies/:movie_id/unwatched', function () {

        describe('logged in', function () {

            it('should return movie not watched when setting the movie unwatched', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.setExampleMovieUnWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: exampleMovies.theToxicAvenger._id,
                            watched: false
                        });
                        done();
                    });
                });
            });

            it('should return movie not watched when setting the movie unwatched which was not watched', function (done) {
                testUtil.setExampleMovieUnWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                        movieId: exampleMovies.theToxicAvenger._id,
                        watched: false
                    });
                    done();
                });
            });

            it('should return a not-found-error when setting unwatched with invalid move_id', function (done) {
                var id = 123;
                testUtil.setExampleMovieUnWatched(exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });
        });

        describe('not logged in', function () {
            it('should return unauthorized when setting the movie unwatched with unposted user', function (done) {
                testUtil.setExampleMovieUnWatched(exampleUsers.unpostedUser, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

    describe('GET /movies/:movie_id/watched', function () {

        describe('logged in', function () {
            it('should return movie watched when getting a watched movie', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.getExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: exampleMovies.theToxicAvenger._id,
                            watched: true
                        });
                        done();
                    });
                });
            });

            it('should return movie not watched when getting a unwatched movie', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.getExampleMovieWatched(exampleUsers.bob, exampleMovies.returnOfTheKillerTomatos._id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: exampleMovies.returnOfTheKillerTomatos._id,
                            watched: false
                        });
                        done();
                    });
                });
            });

            it('should return movie not watched when getting a watched movie of another user', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.getExampleMovieWatched(exampleUsers.alice, exampleMovies.theToxicAvenger._id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: exampleMovies.theToxicAvenger._id,
                            watched: false
                        });
                        testUtil.getExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                            testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                                movieId: exampleMovies.theToxicAvenger._id,
                                watched: true
                            });
                            done();
                        });
                    });
                });
            });

            it('should return a empty user-array when getting the movie which just I have seen', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.getExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieUsersWatchedResponse(res, 200, []);
                        done();
                    });
                });
            });

            it('should return a user-array containing all other users who have watched the posted movie when getting the movie I have watched too', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.putExampleMovieWatched(exampleUsers.alice, exampleMovies.theToxicAvenger._id, function (err, res) {
                        testUtil.getExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                            testUtil.evaluateSuccessfulMovieUsersWatchedResponse(res, 200, [exampleUsers.alice]);
                            testUtil.getExampleMovieWatched(exampleUsers.alice, exampleMovies.theToxicAvenger._id, function (err, res) {
                                testUtil.evaluateSuccessfulMovieUsersWatchedResponse(res, 200, [exampleUsers.bob]);
                                done();
                            });
                        });
                    });
                });
            });

            it('should return a user-array containing all other users who have watched the posted movie when getting the movie I have not watched', function (done) {
                testUtil.putExampleMovieWatched(exampleUsers.alice, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.getExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieUsersWatchedResponse(res, 200, [exampleUsers.alice]);
                        testUtil.getExampleMovieWatched(exampleUsers.alice, exampleMovies.theToxicAvenger._id, function (err, res) {
                            testUtil.evaluateSuccessfulMovieUsersWatchedResponse(res, 200, []);
                            done();
                        });
                    });
                });
            });

            it('should return a not-found-error when getting a watched movie with invalid move_id', function (done) {
                var id = 123;
                testUtil.getExampleMovieWatched(exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not logged in', function () {
            it('should return unauthorized when getting the movie watched with unposted user', function (done) {
                testUtil.getExampleMovieWatched(exampleUsers.unpostedUser, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

});
