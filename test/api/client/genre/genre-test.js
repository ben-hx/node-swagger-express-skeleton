'use strict';
var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/user");
var Movie = require("../../../../models/movie");
var testUtil = require("../helpers/test-util");
var exampleUsers = require("../helpers/exampleUsers");
var exampleMovies = require("../helpers/examleMovies");


describe('Movie-Endpoint Tests', function () {

    before(function (done) {
        User.collection.drop(function () {
            testUtil.registerExampleUser(exampleUsers.bob, function () {
                testUtil.registerExampleUser(exampleUsers.alice, done);
            });
        });
    });

    beforeEach(function (done) {
        Movie.collection.drop(function () {
            done();
        });
    });

    after(function (done) {
        User.collection.drop(function () {
            done();
        });
    });

    afterEach(function (done) {
        Movie.collection.drop(function () {
            done();
        });
    });

    describe('GET /movies', function () {

        describe('logged in', function () {

            function postMovieArray(user, movies, done) {
                var movieCount = movies.length;
                var isFinished = false;
                for (var i = 0; i < movies.length; ++i) {
                    testUtil.postExampleMovie(user, movies[i], function (err, res) {
                        if (isFinished) {
                            return;
                        }
                        if (err) {
                            isFinished = true;
                            return done(err);
                        }
                        --movieCount || done();
                    });
                }
            }

            it('should return posted genres of no movie', function (done) {
                testUtil.getGenres(exampleUsers.bob, function (err, res) {
                    testUtil.evaluateSuccessfulGenresResponse(res, 200, []);
                    done();
                });
            });

            it('should return posted genres of one movie', function (done) {
                postMovieArray(exampleUsers.bob, [
                    exampleMovies.theToxicAvenger
                ], function (err) {
                    testUtil.getGenres(exampleUsers.bob, function (err, res) {
                        testUtil.evaluateSuccessfulGenresResponse(res, 200, exampleMovies.theToxicAvenger.genres);
                        done();
                    });
                });
            });

            it('should return posted genres of more movies', function (done) {
                postMovieArray(exampleUsers.bob, [
                    exampleMovies.theToxicAvenger,
                    exampleMovies.returnOfTheKillerTomatos
                ], function (err) {
                    testUtil.getGenres(exampleUsers.bob, function (err, res) {
                        var genres = exampleMovies.theToxicAvenger.genres.concat(exampleMovies.returnOfTheKillerTomatos.genres);
                        testUtil.evaluateSuccessfulGenresResponse(res, 200, genres);
                        done();
                    });
                });
            });

        });

        describe('not logged in', function () {

            it('should return unauthorized when getting genres from unposted user', function (done) {
                testUtil.getGenres(exampleUsers.unpostedUser, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

});
