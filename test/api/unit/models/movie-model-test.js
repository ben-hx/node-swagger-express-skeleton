'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Movie-Model-Tests', function () {

    var User = require("../../../../models/user");
    var Movie = require("../../../../models/movie");

    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var exampleMovies = testFactory.exampleData.generateMovies();
    var dbTestUtil = testFactory.dbTestUtil();
    var movieTestUtil = testFactory.movieTestUtil();
    var userTestUtil = testFactory.userTestUtil();
    var movieEvaluation = testFactory.movieEvaluation();
    var errorEvaluation = testFactory.errorEvaluation();

    before(dbTestUtil.setUpDb);

    after(dbTestUtil.tearDownDb);

    beforeEach(function (done) {
        exampleUsers = testFactory.exampleData.generateUsers();
        exampleMovies = testFactory.exampleData.generateMovies();
        q.all([
            User.remove(),
            Movie.remove(),
            userTestUtil.saveExampleUser(exampleUsers.bob),
            userTestUtil.saveExampleUser(exampleUsers.alice),
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            User.remove(),
            Movie.remove()
        ]).then(function () {
            done();
        });
    });

    describe('save() inclusive Plugin: toObjectTransformation', function () {

        it('should return a movie when saving with valid movie-data', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                movieEvaluation.evaluateMovie(result.toObject(), exampleMovies.theToxicAvenger);
                done();
            });
        });

        it('should return a movie when saving minimal movie-data', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvengerMinimal, exampleUsers.bob).then(function (result) {
                movieEvaluation.evaluateMovie(result.toObject(), exampleMovies.theToxicAvengerMinimal);
                done();
            });
        });

        it('should return an error when saving two movies with the same title', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function () {
                return movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvengerSame, exampleUsers.bob);
            }).catch(function () {
                done();
            });
        });

        it('should return an error when saving invalid movie-data', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvengerInvalid, exampleUsers.bob).catch(function (error) {
                done();
            });
        });

    });

    describe('Plugin: lastModified', function () {

        it('should return a movie with lastModified-field when saving Object', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvengerMinimal, exampleUsers.bob).then(function (result) {
                var transformedObject = result.toObject();
                transformedObject.should.have.ownProperty('lastModified');
                done();
            });
        });

    });

});