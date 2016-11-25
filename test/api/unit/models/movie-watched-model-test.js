'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Movie-Watched-Model-Tests', function () {

    var mongoose = require('mongoose');
    var User = require("../../../../models/user");
    var Movie = require("../../../../models/movie");
    var MovieWatched = require("../../../../models/movie-watched");

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

    describe('save() inclusive Plugin: toObjectTransformation', function () {

        it('should return movie-watched when saving data', function (done) {
            var data = {
                user: exampleUsers.bob._id,
                movie: exampleMovies.theToxicAvenger._id
            };
            var movieWatched = new MovieWatched(data);
            movieWatched.save().then(function (result) {
                var expected = {
                    movie: exampleMovies.theToxicAvenger._id,
                    user: exampleUsers.bob._id,
                    watched: true
                };
                movieEvaluation.evaluateMovieWatched(result.toObject(), expected);
                done();
            });
        });

        it('should return an error when saving with invalid movie', function (done) {
            var data = {
                user: exampleUsers.bob._id,
                movie: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')
            };
            var movieWatched = new MovieWatched(data);
            movieWatched.save().catch(function () {
                done();
            });
        });

        it('should return an error when saving with invalid user', function (done) {
            var data = {
                user: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'),
                movie: exampleMovies.theToxicAvenger._id
            };
            var movieWatched = new MovieWatched(data);
            movieWatched.save().catch(function () {
                done();
            });
        });

    });

    describe('Plugin: lastModified', function () {

        it('should return movie-watched with lastModified-field when saving Object', function (done) {
            var data = {
                user: exampleUsers.bob._id,
                movie: exampleMovies.theToxicAvenger._id
            };
            var movieWatched = new MovieWatched(data);
            movieWatched.save().then(function (result) {
                var transformedObject = result.toObject();
                transformedObject.should.have.ownProperty('lastModified');
                done();
            });
        });

    });

});