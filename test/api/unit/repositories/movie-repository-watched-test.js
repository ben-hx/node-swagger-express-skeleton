'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Movie-Repository-Watched-Tests', function () {

    var mongoose = require('mongoose');
    var User = require("../../../../models/user");
    var Movie = require("../../../../models/movie");
    var MovieWatched = require("../../../../models/movie-watched");

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
                Movie.remove()
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
            MovieWatched.remove()
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            MovieWatched.remove()
        ]).then(function () {
            done();
        });
    });

    describe('setWatchedByMovieIdAndUserId()', function () {

        it('should return movie watched when setting the movie watched', function (done) {
            movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id).then(function (result) {
                var expected = {
                    movie: exampleMovies.theToxicAvenger._id,
                    user: exampleUsers.bob._id,
                    watched: true
                };
                movieEvaluation.evaluateMovieWatched(result, expected);
                done();
            });
        });

        it('should return an error when setting the movie watched a secound time', function (done) {
            movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id).then(function (result) {
                return movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when setting the movie watched with invalid movie', function (done) {
            movieRepository.setWatchedByMovieIdAndUserId(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), exampleUsers.bob._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when setting the movie watched with invalid user', function (done) {
            movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteWatchedByMovieIdAndUserId()', function () {

        beforeEach(function () {
            return q.all([
                movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id),
            ]);
        });

        it('should return movie not watched when setting the movie unwatched', function (done) {
            movieRepository.deleteWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id).then(function (result) {
                var expected = {
                    movie: exampleMovies.theToxicAvenger._id,
                    user: exampleUsers.bob._id,
                    watched: false
                };
                movieEvaluation.evaluateMovieWatched(result, expected);
                done();
            });
        });

        it('should return error when setting the movie unwatched with invalid movie', function (done) {
            movieRepository.deleteWatchedByMovieIdAndUserId(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), exampleUsers.bob._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when setting the movie unwatched with invalid user', function (done) {
            movieRepository.deleteWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

    });

    describe('getWatchedByMovieIdAndUserId()', function () {

        beforeEach(function () {
            return q.all([
                movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id),
                movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.returnOfTheKillerTomatos._id, exampleUsers.alice._id),
            ]);
        });

        it('should return movie watched when getting watched movie', function (done) {
            movieRepository.getWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id).then(function (result) {
                var expected = {
                    movie: exampleMovies.theToxicAvenger._id,
                    user: exampleUsers.bob._id,
                    watched: true
                };
                movieEvaluation.evaluateMovieWatched(result, expected);
                done();
            });
        });

        it('should return movie unwatched when getting unwatched movie', function (done) {
            movieRepository.getWatchedByMovieIdAndUserId(exampleMovies.returnOfTheKillerTomatos._id, exampleUsers.bob._id).then(function (result) {
                var expected = {
                    movie: exampleMovies.returnOfTheKillerTomatos._id,
                    user: exampleUsers.bob._id,
                    watched: false
                };
                movieEvaluation.evaluateMovieWatched(result, expected);
                done();
            });
        });

    });

    describe('getUsersWatchedByMovieId()', function () {

        beforeEach(function () {
            return q.all([
                movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id),
                movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.alice._id),
            ]);
        });

        it('should return user ids when getting users watched movie', function (done) {
            movieRepository.getUsersWatchedByMovieId(exampleMovies.theToxicAvenger._id).then(function (result) {
                var expected = [
                    exampleUsers.bob._id,
                    exampleUsers.alice._id
                ];
                movieEvaluation.evaluateUserIdsMovieWatched(result, expected);
                done();
            }).catch(function (error) {
                console.log(error);
            });
        });

        it('should return array of full users when getting users watched movie with option: population=true', function (done) {
            movieRepository.getUsersWatchedByMovieId(exampleMovies.theToxicAvenger._id, {populate: true}).then(function (result) {
                var expected = [
                    exampleUsers.bob,
                    exampleUsers.alice
                ];
                userEvaluation.evaluateUsers(result, expected);
                done();
            });
        });

        it('should return empty array when getting unwatched movie', function (done) {
            movieRepository.getUsersWatchedByMovieId(exampleMovies.returnOfTheKillerTomatos._id).then(function (result) {
                var expected = [];
                movieEvaluation.evaluateUserIdsMovieWatched(result, expected);
                done();
            });
        });

    });

    describe('getMoviesWatchedByUserId()', function () {

        beforeEach(function () {
            return q.all([
                movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.theToxicAvenger._id, exampleUsers.bob._id),
                movieRepository.setWatchedByMovieIdAndUserId(exampleMovies.returnOfTheKillerTomatos._id, exampleUsers.bob._id),
            ]);
        });

        it('should return movie ids when getting movies watched user', function (done) {
            movieRepository.getMoviesWatchedByUserId(exampleUsers.bob._id).then(function (result) {
                var expected = [
                    exampleMovies.theToxicAvenger._id,
                    exampleMovies.returnOfTheKillerTomatos._id
                ];
                movieEvaluation.evaluateMovieIdsUserWatched(result, expected);
                done();
            });
        });

        it('should return array of full movies when getting movies watched by user with option: population=true', function (done) {
            movieRepository.getMoviesWatchedByUserId(exampleUsers.bob._id, {populate: true}).then(function (result) {
                var expected = [
                    exampleMovies.theToxicAvenger,
                    exampleMovies.returnOfTheKillerTomatos
                ];
                movieEvaluation.evaluateMovies(result, expected);
                done();
            });
        });

        it('should return empty array when getting user who has watchd no movie', function (done) {
            movieRepository.getMoviesWatchedByUserId(exampleUsers.alice._id).then(function (result) {
                var expected = [];
                movieEvaluation.evaluateMovieIdsUserWatched(result, expected);
                done();
            });
        });

    });

});