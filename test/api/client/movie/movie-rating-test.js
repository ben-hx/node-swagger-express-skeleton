'use strict';
var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/user");
var Movie = require("../../../../models/movie");
var MovieRating = require("../../../../models/movie-rating");
var MovieWatched = require("../../../../models/movie-watched");
var testUtil = require("../helpers/test-util");
var exampleUsers = require("../helpers/exampleUsers");
var exampleMovies = require("../helpers/examleMovies");


describe('Movie-Rating-Endpoint Tests', function () {

    before(function (done) {
        User.collection.drop(function () {
            testUtil.registerExampleUser(exampleUsers.bob, function () {
                testUtil.registerExampleUser(exampleUsers.alice, function () {
                    Movie.collection.drop(function () {
                        testUtil.postExampleMovie(exampleUsers.bob, exampleMovies.theToxicAvenger, function () {
                            testUtil.postExampleMovie(exampleUsers.bob, exampleMovies.returnOfTheKillerTomatos, function () {
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    beforeEach(function (done) {
        MovieRating.collection.drop(function () {
            MovieWatched.collection.drop(function () {
                done();
            });
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
        MovieRating.collection.drop(function () {
            MovieWatched.collection.drop(function () {
                done();
            });
        });
    });

    describe('PUT /movies/:movie_id/rating', function () {

        describe('logged in', function () {

            it('should return movie rating when setting the movies rating', function (done) {
                var ratingValue = 2;
                testUtil.setExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.putExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, ratingValue, function (err, res) {
                        testUtil.evaluateSuccessfulMovieRatingResponse(res, 200, ratingValue);
                        done();
                    });
                });
            });

            it('should return movie rating when setting the movies rating a secound time', function (done) {
                var ratingValue = 2;
                testUtil.setExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.putExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, ratingValue, function (err, res) {
                        testUtil.putExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, ++ratingValue, function (err, res) {
                            testUtil.evaluateSuccessfulMovieRatingResponse(res, 200, ratingValue);
                            done();
                        });
                    });
                });
            });

            it('should return a not-found-error when setting the rate with invalid movie_id', function (done) {
                var id = 123;
                var ratingValue = 2;
                testUtil.putExampleMovieRating(exampleUsers.bob, id, ratingValue, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });

            it('should return a validation-error when setting the rate of unwatched movie', function (done) {
                var ratingValue = 2;
                testUtil.putExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, ratingValue, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 400);
                    done();
                });
            });

        });

        describe('not logged in', function () {
            it('should return unauthorized when setting the movies rating with unposted user', function (done) {
                var ratingValue = 2;
                testUtil.putExampleMovieRating(exampleUsers.unpostedUser, exampleMovies.theToxicAvenger._id, ratingValue, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

    describe('GET /movies/:movie_id/rating', function () {

        describe('logged in', function () {

            it('should return movie rating when getting a rated movie', function (done) {
                var ratingValue = 2;
                testUtil.setExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.putExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, ratingValue, function (err, res) {
                        testUtil.getExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                            testUtil.evaluateSuccessfulMovieUsersRatingResponse(res, 200, []);
                            done();
                        });
                    });

                });
            });

        });
    });
});
