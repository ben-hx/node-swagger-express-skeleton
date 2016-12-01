'use strict';
var chai = require('chai');

var q = require('q');


describe('Movie-Rating-Endpoint Tests', function () {

    var testConfig = require('../test-init');
    var User = require("../../../../models/user");
    var InaktiveUser = require("../../../../models/inaktive-user");
    var Movie = require("../../../../models/movie");
    var MovieWatched = require("../../../../models/movie-watched");
    var MovieRating = require("../../../../models/movie-rating");
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
                MovieWatched.remove(),
            ]);
        }).then(function () {
            return q.all([
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
            return q.all([
                api.putMovieWatched(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id),
                api.putMovieWatched(exampleUsers.looserBob, exampleMovies.theToxicAvenger._id),
            ]);
        }).then(function () {
            done();
        });

    });

    after(function (done) {
        q.all([
            User.remove(),
            InaktiveUser.remove(),
            Movie.remove(),
            MovieWatched.remove(),
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
            MovieRating.remove()
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            MovieRating.remove(),
        ]).then(function () {
            done();
        });
    });


    describe('PUT /movie/:movie_id/rating', function () {

        describe('authenticated', function () {

            it('should return 200 with movie-rating when setting movie rating', function (done) {
                api.putMovieRating(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id, 1).then(function (res) {
                    var expected = {
                        movie: exampleMovies.theToxicAvenger._id,
                        rating: {
                            value: 1
                        },
                        averageRating: {
                            value: 1
                        }
                    };
                    apiEvaluation.evaluateMovieRatingResponse(res, 200, expected);
                    done();
                });
            });

            it('should return 400 validation-error when setting with invalid movie rating', function (done) {
                api.putMovieRating(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id, 22).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

            it('should return 404 not-found-error when setting with invalid movie-id', function (done) {
                api.putMovieRating(exampleUsers.adminBob, 123, 1).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when setting movie watched', function (done) {
                api.putMovieRating(exampleUsers.alice, exampleMovies.theToxicAvenger._id, 2).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('DELETE /movie/:movie_id/rating', function () {

        beforeEach(function (done) {
            q.all([
                api.putMovieRating(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id, 1)
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movie-rating when deleting movie rating', function (done) {
                api.deleteMovieRating(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id).then(function (res) {
                    var expected = {
                        movie: exampleMovies.theToxicAvenger._id,
                        rating: {
                            value: 1
                        },
                        averageRating: {
                            value: 0
                        }
                    };
                    apiEvaluation.evaluateMovieRatingResponse(res, 200, expected);
                    done();
                });
            });

            it('should return 400 validattion-error when deleting unrated movie', function (done) {
                api.deleteMovieRating(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

            it('should return 404 not-found-error when deleting invalid movie-id', function (done) {
                api.deleteMovieRating(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when deleting movie rating', function (done) {
                api.deleteMovieRating(exampleUsers.alice, exampleMovies.theToxicAvenger._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('GET /movie/:movie_id/rating', function () {

        beforeEach(function (done) {
            q.all([
                api.putMovieRating(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id, 10),
                api.putMovieRating(exampleUsers.looserBob, exampleMovies.theToxicAvenger._id, 3)
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movie-rating when getting movie rating', function (done) {
                api.getMovieRating(exampleUsers.adminBob, exampleMovies.theToxicAvenger._id).then(function (res) {
                    var expected = {
                        movie: exampleMovies.theToxicAvenger._id,
                        rating: {
                            value: 10
                        },
                        averageRating: {
                            value: 6.5
                        }
                    };
                    apiEvaluation.evaluateMovieRatingResponse(res, 200, expected);
                    done();
                });
            });

            it('should return 200 with movie-rating null when getting unrated movie', function (done) {
                api.getMovieRating(exampleUsers.adminBob, exampleMovies.returnOfTheKillerTomatos._id).then(function (res) {
                    var expected = {
                        movie: exampleMovies.returnOfTheKillerTomatos._id,
                        rating: {
                            value: null
                        },
                        averageRating: {
                            value: 0
                        }
                    };
                    apiEvaluation.evaluateMovieRatingResponse(res, 200, expected);
                    done();
                });
            });

            it('should return 404 not-found-error when getting invalid movie-id', function (done) {
                api.getMovieRating(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when getting movie rating', function (done) {
                api.getMovieRating(exampleUsers.alice, exampleMovies.theToxicAvenger._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

});