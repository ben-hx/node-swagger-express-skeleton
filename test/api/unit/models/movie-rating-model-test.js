'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Movie-Rating-Model-Tests', function () {

    var mongoose = require('mongoose');
    var User = require("../../../../models/user");
    var Movie = require("../../../../models/movie");
    var MovieWatched = require("../../../../models/movie-watched");
    var MovieRating = require("../../../../models/movie-rating");

    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var exampleMovies = testFactory.exampleData.generateMovies();
    var dbTestUtil = testFactory.dbTestUtil();
    var movieTestUtil = testFactory.movieTestUtil();
    var userTestUtil = testFactory.userTestUtil();
    var movieEvaluation = testFactory.movieEvaluation();

    before(function (done) {
        exampleUsers = testFactory.exampleData.generateUsers();
        exampleMovies = testFactory.exampleData.generateMovies();
        q.all([
            dbTestUtil.setUpDb(),
            User.remove(),
            Movie.remove(),
            userTestUtil.saveExampleUser(exampleUsers.bob),
            userTestUtil.saveExampleUser(exampleUsers.alice),
            userTestUtil.saveExampleUser(exampleUsers.eve)
        ]).then(function () {
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
            Movie.remove(),
            dbTestUtil.tearDownDb()
        ]).then(function () {
            done();
        });
    });

    beforeEach(function (done) {
        q.all([
            MovieWatched.remove(),
            MovieRating.remove(),
            movieTestUtil.watchExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob)
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            MovieWatched.remove(),
            MovieRating.remove(),
        ]).then(function () {
            done();
        });
    });

    describe('save() inclusive Plugin: toObjectTransformation', function () {

        it('should return movie-rating when saving data', function (done) {
            movieTestUtil.rateExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob, 5).then(function (result) {
                var expected = {
                    movie: exampleMovies.theToxicAvenger._id,
                    user: exampleUsers.bob._id,
                    value: 5
                };
                movieEvaluation.evaluateMovieRating(result.toObject(), expected);
                done();
            });
        });

        it('should return an error when saving with value < 0', function (done) {
            movieTestUtil.rateExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob, -1).catch(function () {
                done();
            });
        });

        it('should return an error when saving with value > 10', function (done) {
            movieTestUtil.rateExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob, 11).catch(function () {
                done();
            });
        });

        it('should return an error when saving with unwatched movie', function (done) {
            movieTestUtil.rateExampleMovieFromUser(exampleMovies.returnOfTheKillerTomatos, exampleUsers.bob, 5).catch(function () {
                done();
            });
        });

        it('should return an error when saving with invalid movie', function (done) {
            movieTestUtil.rateExampleMovieFromUser(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), exampleUsers.bob, 5).catch(function () {
                done();
            });
        });

        it('should return an error when saving with invalid user', function (done) {
            movieTestUtil.rateExampleMovieFromUser(exampleMovies.theToxicAvenger, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), 5).catch(function () {
                done();
            });
        });

    });

    describe('Plugin: lastModified', function () {

        it('should return a movie-rating with lastModified-field when saving Object', function (done) {
            movieTestUtil.rateExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob, 5).then(function (result) {
                var transformedObject = result.toObject();
                transformedObject.should.have.ownProperty('lastModified');
                done();
            });
        });

    });

});