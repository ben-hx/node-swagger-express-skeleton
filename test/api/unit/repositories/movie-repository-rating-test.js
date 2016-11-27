'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Movie-Repository-Watched-Tests', function () {

    var mongoose = require('mongoose');
    var User = require("../../../../models/user");
    var Movie = require("../../../../models/movie");
    var MovieWatched = require("../../../../models/movie-watched");
    var MovieRating = require("../../../../models/movie-rating");

    var testFactory = require("../../helpers/test-factory")();
    var config = testFactory.config;
    var exampleUsers = testFactory.exampleData.generateUsers();
    var exampleMovies = testFactory.exampleData.generateMovies();
    var dbTestUtil = testFactory.dbTestUtil();
    var movieTestUtil = testFactory.movieTestUtil();
    var movieRepository = testFactory.movieTestUtil().repositoryDecorator;
    var userTestUtil = testFactory.userTestUtil();
    var movieEvaluation = testFactory.movieEvaluation();
    var userEvaluation = testFactory.userEvaluation();
    var errorEvaluation = testFactory.errorEvaluation();

    before(function (done) {
        exampleUsers = testFactory.exampleData.generateUsers();
        exampleMovies = testFactory.exampleData.generateMovies();
        q.all([
            dbTestUtil.setUpDb()
        ]).then(function () {
            return q.all([
                User.remove(),
                Movie.remove(),
                MovieWatched.remove()
            ]);
        }).then(function () {
            return q.all([
                userTestUtil.saveExampleUser(exampleUsers.bob),
                userTestUtil.saveExampleUser(exampleUsers.alice),
                userTestUtil.saveExampleUser(exampleUsers.eve)
            ]);
        }).then(function () {
            return q.all([
                movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob),
                movieTestUtil.saveExampleMovieFromUser(exampleMovies.returnOfTheKillerTomatos, exampleUsers.eve)
            ]);
        }).then(function () {
            return q.all([
                movieTestUtil.watchExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob),
                movieTestUtil.watchExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.alice),
                movieTestUtil.watchExampleMovieFromUser(exampleMovies.returnOfTheKillerTomatos, exampleUsers.bob)
            ]);
        }).then(function () {
            done();
        });
    });

    after(function (done) {
        q.all([
            User.remove(),
            Movie.remove()
        ]).then(function () {
            return q.all([
                dbTestUtil.tearDownDb()
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
            MovieRating.remove()
        ]).then(function () {
            done();
        });
    });

    describe('setRatingByMovieIdAndUserId()', function () {

        it('should return movie rating when setting the movie rating', function (done) {
            movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id, 5).then(function (result) {
                var expected = {
                    movie: exampleMovies.theToxicAvenger._id,
                    user: exampleUsers.bob._id,
                    value: 5
                };
                movieEvaluation.evaluateMovieRating(result, expected);
                done();
            });
        });

        it('should return movie rating when setting the movie rating a secound time', function (done) {
            movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id, 5).then(function (result) {
                return movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id, 4);
            }).then(function (result) {
                var expected = {
                    movie: exampleMovies.theToxicAvenger._id,
                    user: exampleUsers.bob._id,
                    value: 4
                };
                movieEvaluation.evaluateMovieRating(result, expected);
                done();
            });
        });

        it('should return an error when setting the movie rating with value < 0', function (done) {
            movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id, -1).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when setting the movie rating with value > 10', function (done) {
            movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id, 11).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when setting the movie rating with invalid movie', function (done) {
            movieRepository.setRatingByMovieIdAndUserId(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), exampleUsers.bob._id, 5).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when setting the movie rating with invalid user', function (done) {
            movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), 5).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteRatingByMovieIdAndUserId()', function () {

        beforeEach(function () {
            return q.all([
                movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id, 5)
            ]);
        });

        it('should return movie not rated when deleting the movie rating', function (done) {
            movieRepository.deleteRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id).then(function (result) {
                var expected = {
                    movie: exampleMovies.theToxicAvenger._id,
                    user: exampleUsers.bob._id,
                    value: 5
                };
                movieEvaluation.evaluateMovieRating(result, expected);
                done();
            });
        });

        it('should return error when deleting the movie rating with invalid movie', function (done) {
            movieRepository.deleteRatingByMovieIdAndUserId(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), exampleUsers.bob._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when deleting the movie rating with invalid user', function (done) {
            movieRepository.deleteRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

    });

    describe('getAverageRatingByMovieId()', function () {

        beforeEach(function () {
            return q.all([
                movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id, 5),
                movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.alice._id, 4),
            ]);
        });

        it('should return average rating when getting average rating', function (done) {
            movieRepository.getAverageRatingByMovieId(exampleMovies.theToxicAvenger._id).then(function (result) {
                var expected = 4.5;
                result.should.be.closeTo(expected, 0.001);
                done();
            });
        });

        it('should return average rating 0 when getting average rating of unreated movie', function (done) {
            movieRepository.getAverageRatingByMovieId(exampleMovies.returnOfTheKillerTomatos._id).then(function (result) {
                var expected = 0;
                result.should.be.closeTo(expected, 0.001);
                done();
            });
        });

    });

    describe('getRatingByMovieId()', function () {

        beforeEach(function () {
            return q.all([
                movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id, 5),
                movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.alice._id, 4),
            ]);
        });

        it('should return user ratings when getting user ratings', function (done) {
            movieRepository.getRatingByMovieId(exampleMovies.theToxicAvenger._id).then(function (result) {
                var expected = [
                    {user: exampleUsers.bob._id, rating: 5},
                    {user: exampleUsers.alice._id, rating: 4}
                ];
                movieEvaluation.evaluateUserIdsMovieRating(result, expected);
                done();
            });
        });

        it('should return array of full users when getting users watched movie with option: population=true', function (done) {
            movieRepository.getRatingByMovieId(exampleMovies.theToxicAvenger._id, {populate: true}).then(function (result) {
                var expected = [
                    {user: exampleUsers.bob, rating: 5},
                    {user: exampleUsers.alice, rating: 4}
                ];
                movieEvaluation.evaluateUsersMovieRating(result, expected);
                done();
            });
        });

        it('should return empty array when getting unrated movie', function (done) {
            movieRepository.getRatingByMovieId(exampleMovies.returnOfTheKillerTomatos._id).then(function (result) {
                var expected = [];
                movieEvaluation.evaluateUserIdsMovieRating(result, expected);
                done();
            });
        });

    });

    describe('getRatingByMovieIdAndUserId()', function () {

        beforeEach(function () {
            return q.all([
                movieRepository.setRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id, 5),
            ]);
        });

        it('should return rating when getting rating', function (done) {
            movieRepository.getRatingByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id).then(function (result) {
                var expected = {
                    movie: exampleMovies.theToxicAvenger._id,
                    user: exampleUsers.bob._id,
                    value: 5
                };
                movieEvaluation.evaluateMovieRating(result, expected);
                done();
            });
        });

        it('should return null rating when getting unrated movie', function (done) {
            movieRepository.getRatingByMovieIdAndUserId(exampleMovies.returnOfTheKillerTomatos._id, exampleUsers.bob._id).then(function (result) {
                var expected = {
                    movie: exampleMovies.returnOfTheKillerTomatos._id,
                    user: exampleUsers.bob._id,
                    value: null
                };
                movieEvaluation.evaluateMovieRating(result, expected);
                done();
            });
        });

    });

});