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


describe('Movie-Watched-Endpoint Tests', function () {

    var theToxicAvengerId;
    var returnOfTheKillerTomatosId;

    before(function (done) {
        User.collection.drop(function () {
            testUtil.registerExampleUser(testUtil.exampleUsers.bob, function () {
                testUtil.registerExampleUser(testUtil.exampleUsers.alice, function () {
                    Movie.collection.drop(function () {
                        testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                            theToxicAvengerId = res.body.data._id;
                            testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.returnOfTheKillerTomatos, function (err, res) {
                                returnOfTheKillerTomatosId = res.body.data._id;
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    beforeEach(function (done) {
        MovieWatched.collection.drop(function () {
            done();
        });
    });

    after(function (done) {
        Movie.collection.drop(function () {
            User.collection.drop(function () {
                done();
            });
        });
    });

    afterEach(function (done) {
        MovieWatched.collection.drop(function () {
            done();
        });
    });

    describe('PUT /movies/:movie_id/watched', function () {

        describe('logged in', function () {

            it('should return movie watched when setting the movie watched', function (done) {
                testUtil.setExampleMovieWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                    testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                        movieId: theToxicAvengerId,
                        watched: true
                    });
                    done();
                });
            });

            it('should return movie watched when setting the movie watched a secound time', function (done) {
                testUtil.setExampleMovieWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                    testUtil.setExampleMovieWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: theToxicAvengerId,
                            watched: true
                        });
                        done();
                    });
                });
            });

            it('should return a not-found-error when setting watched with invalid move_id', function (done) {
                var id = 123;
                testUtil.setExampleMovieWatched(testUtil.exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });
        });

        describe('not logged in', function () {
            it('should return unauthorized when setting the movie watched with unposted user', function (done) {
                testUtil.setExampleMovieWatched(testUtil.exampleUsers.unpostedUser, theToxicAvengerId, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

    describe('PUT /movies/:movie_id/unwatched', function () {

        describe('logged in', function () {

            it('should return movie not watched when setting the movie unwatched', function (done) {
                testUtil.setExampleMovieWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                    testUtil.setExampleMovieUnWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: theToxicAvengerId,
                            watched: false
                        });
                        done();
                    });
                });
            });

            it('should return movie not watched when setting the movie unwatched which was not watched', function (done) {
                testUtil.setExampleMovieUnWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                    testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                        movieId: theToxicAvengerId,
                        watched: false
                    });
                    done();
                });
            });

            it('should return a not-found-error when setting unwatched with invalid move_id', function (done) {
                var id = 123;
                testUtil.setExampleMovieUnWatched(testUtil.exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });
        });

        describe('not logged in', function () {
            it('should return unauthorized when setting the movie unwatched with unposted user', function (done) {
                testUtil.setExampleMovieUnWatched(testUtil.exampleUsers.unpostedUser, theToxicAvengerId, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

    describe('GET /movies/:movie_id/watched', function () {

        describe('logged in', function () {
            it('should return movie watched when getting a watched movie', function (done) {
                testUtil.setExampleMovieWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                    testUtil.getExampleMovieWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: theToxicAvengerId,
                            watched: true
                        });
                        done();
                    });
                });
            });

            it('should return movie not watched when getting a unwatched movie', function (done) {
                testUtil.setExampleMovieWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                    testUtil.getExampleMovieWatched(testUtil.exampleUsers.bob, returnOfTheKillerTomatosId, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: returnOfTheKillerTomatosId,
                            watched: false
                        });
                        done();
                    });
                });
            });

            it('should return movie not watched when getting a watched movie of another user', function (done) {
                testUtil.setExampleMovieWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                    testUtil.getExampleMovieWatched(testUtil.exampleUsers.alice, theToxicAvengerId, function (err, res) {
                        testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                            movieId: theToxicAvengerId,
                            watched: false
                        });
                        testUtil.getExampleMovieWatched(testUtil.exampleUsers.bob, theToxicAvengerId, function (err, res) {
                            testUtil.evaluateSuccessfulMovieWatchedResponse(res, 200, {
                                movieId: theToxicAvengerId,
                                watched: true
                            });
                            done();
                        });
                    });
                });
            });

            it('should return a not-found-error when getting watched with invalid move_id', function (done) {
                var id = 123;
                testUtil.getExampleMovieWatched(testUtil.exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not logged in', function () {
            it('should return unauthorized when getting the movie watched with unposted user', function (done) {
                testUtil.getExampleMovieWatched(testUtil.exampleUsers.unpostedUser, theToxicAvengerId, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

});
