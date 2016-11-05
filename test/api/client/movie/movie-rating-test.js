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

    var dropForEach = [
        MovieRating,
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

    describe('PUT /movies/:movie_id/rating', function () {

        describe('logged in', function () {

            it('should return movie rating when setting the movies rating', function (done) {
                var ratingValue = 2;
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.putExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, ratingValue, function (err, res) {
                        testUtil.evaluateSuccessfulMovieRatingResponse(res, 200, ratingValue);
                        done();
                    });
                });
            });

            it('should return movie rating when setting the movies rating a secound time', function (done) {
                var ratingValue = 2;
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
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

            it('should return movie rating when getting a movie which is rated by the the logged in user', function (done) {
                var ratingValue = 2;
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.putExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, ratingValue, function (err, res) {
                        testUtil.getExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                            testUtil.evaluateSuccessfulMovieUsersRatingResponse(res, 200, []);
                            done();
                        });
                    });

                });
            });

            function putExampleMovieRatingForUser(rating, done) {
                testUtil.putExampleMovieWatched(rating.user, rating.movie._id, function (err, res) {
                    testUtil.putExampleMovieRating(rating.user, rating.movie._id, rating.rating, function (err, res) {
                        testUtil.getExampleMovieRating(rating.user, rating.movie._id, function (err, res) {
                            done();
                        });
                    });
                });
            }

            function putExampleMovieRatingForUsers(ratings, done) {
                var ratingsCount = ratings.length;
                for (var rating in ratings) {
                    putExampleMovieRatingForUser(ratings[rating], function () {
                        --ratingsCount || done();
                    });
                }
            }

            it('should return movie rating when getting a movie which is rated by the the logged in user and one other user', function (done) {
                var ratings = [
                    {user: exampleUsers.bob, movie: exampleMovies.theToxicAvenger, rating: 3},
                    {user: exampleUsers.alice, movie: exampleMovies.theToxicAvenger, rating: 2},
                    {user: exampleUsers.eve, movie: exampleMovies.theToxicAvenger, rating: 4},
                ];
                putExampleMovieRatingForUsers(ratings, function () {
                    testUtil.getExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        delete ratings[0];
                        testUtil.evaluateSuccessfulMovieUsersRatingResponse(res, 200, ratings);
                        done();
                    });
                });
            });


        });
    });
})
;
