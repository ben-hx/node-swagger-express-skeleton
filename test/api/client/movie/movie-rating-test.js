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

    function putExampleMovieRatingForUser(rating, done) {
        testUtil.putExampleMovieWatched(rating.user, rating.movie._id, function (err, res) {
            testUtil.putExampleMovieRating(rating.user, rating.movie._id, rating.ownRating, function (err, res) {
                done();
            });
        });
    }

    function putExampleMovieRatingForUsers(ratings, done) {
        var ratingsCount = ratings.length;
        for (var i in ratings) {
            putExampleMovieRatingForUser(ratings[i], function () {
                --ratingsCount || done();
            });
        }
    }

    function getAverageRatingForMovieFromRatings(movie, ratings) {
        var result = 0;
        var ratingsCount = 0;
        for (var i in ratings) {
            if (ratings[i].movie == movie) {
                result = result + ratings[i].ownRating;
                ratingsCount++;
            }
        }
        return result / ratingsCount;
    }

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

            it('should return a validation-error when setting the rate lower than 0', function (done) {
                var ratingValue = -1;
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.putExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, ratingValue, function (err, res) {
                        testUtil.evaluateErrorResponse(res, 400);
                        done();
                    });
                });
            });

            it('should return a validation-error when setting the rate higher than 10', function (done) {
                var ratingValue = 11;
                testUtil.putExampleMovieWatched(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                    testUtil.putExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, ratingValue, function (err, res) {
                        testUtil.evaluateErrorResponse(res, 400);
                        done();
                    });
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
                var ratings = [
                    {user: exampleUsers.bob, movie: exampleMovies.theToxicAvenger, ownRating: 3},
                ];
                putExampleMovieRatingForUsers(ratings, function () {
                    testUtil.getExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        var expectedOwnRating = ratings[0].ownRating;
                        var expectedAverageRating = getAverageRatingForMovieFromRatings(exampleMovies.theToxicAvenger, ratings);
                        var expectedUsersRating = ratings.slice(1);
                        testUtil.evaluateSuccessfulMovieUsersRatingResponse(res, 200, {
                            usersRating: expectedUsersRating,
                            ownRating: expectedOwnRating,
                            averageRating: expectedAverageRating
                        });
                        done();
                    });
                });
            });

            it('should return movie rating when getting a movie which is rated by the the logged in user and other users', function (done) {
                var ratings = [
                    {user: exampleUsers.bob, movie: exampleMovies.theToxicAvenger, ownRating: 3},
                    {user: exampleUsers.alice, movie: exampleMovies.theToxicAvenger, ownRating: 2},
                    {user: exampleUsers.eve, movie: exampleMovies.theToxicAvenger, ownRating: 5},
                ];
                putExampleMovieRatingForUsers(ratings, function () {
                    testUtil.getExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        var expectedOwnRating = ratings[0].ownRating;
                        var expectedAverageRating = getAverageRatingForMovieFromRatings(exampleMovies.theToxicAvenger, ratings);
                        var expectedUsersRating = ratings.slice(1);
                        testUtil.evaluateSuccessfulMovieUsersRatingResponse(res, 200, {
                            usersRating: expectedUsersRating,
                            ownRating: expectedOwnRating,
                            averageRating: expectedAverageRating
                        });
                        done();
                    });
                });
            });

            it('should return movie rating when getting a movie which is rated by the the logged in user and one other user', function (done) {
                var ratings = [
                    {user: exampleUsers.bob, movie: exampleMovies.theToxicAvenger, ownRating: 3},
                    {user: exampleUsers.alice, movie: exampleMovies.theToxicAvenger, ownRating: 2},
                    {user: exampleUsers.eve, movie: exampleMovies.returnOfTheKillerTomatos, ownRating: 5},
                ];
                putExampleMovieRatingForUsers(ratings, function () {
                    testUtil.getExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        var expectedOwnRating = ratings[0].ownRating;
                        var expectedUsersRating = ratings.slice(1, 2);
                        var expectedAverageRating = getAverageRatingForMovieFromRatings(exampleMovies.theToxicAvenger, ratings);
                        testUtil.evaluateSuccessfulMovieUsersRatingResponse(res, 200, {
                            usersRating: expectedUsersRating,
                            ownRating: expectedOwnRating,
                            averageRating: expectedAverageRating
                        });
                        done();
                    });
                });
            });

            it('should return movie rating when getting a movie which is not rated by the the logged in user but rated by other users', function (done) {
                var ratings = [
                    {user: exampleUsers.alice, movie: exampleMovies.theToxicAvenger, ownRating: 2},
                    {user: exampleUsers.eve, movie: exampleMovies.theToxicAvenger, ownRating: 5},
                ];
                putExampleMovieRatingForUsers(ratings, function () {
                    testUtil.getExampleMovieRating(exampleUsers.bob, exampleMovies.theToxicAvenger._id, function (err, res) {
                        var expectedOwnRating = null;
                        var expectedAverageRating = getAverageRatingForMovieFromRatings(exampleMovies.theToxicAvenger, ratings);
                        var expectedUsersRating = ratings;
                        testUtil.evaluateSuccessfulMovieUsersRatingResponse(res, 200, {
                            usersRating: expectedUsersRating,
                            ownRating: expectedOwnRating,
                            averageRating: expectedAverageRating
                        });
                        done();
                    });
                });
            });
        });
    });
});
