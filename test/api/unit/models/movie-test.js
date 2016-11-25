'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Movie-Model-Tests', function () {

    var errors = require("../../../../errors/errors");
    var generateExampleUsers = require("../../helpers/example-users").generate;
    var generateExampleMovies = require("../../helpers/examle-movies").generate;
    var exampleUsers = generateExampleUsers();
    var exampleMovies = generateExampleMovies();
    var User = require("../../../../models/user");
    var InaktiveUser = require("../../../../models/inaktive-user");
    var Movie = require("../../../../models/movie");

    var dbTestUtil = require('../../helpers/db/db-test-util')();
    var movieTestUtil = require('../../helpers/movie/movie-test-util')(Movie);
    var userTestUtil = require('../../helpers/user/user-test-util')(User);
    var movieEvaluation = require('../../helpers/movie/movie-evaluation-util')();
    var errorEvaluation = require('../../helpers/error/error-evaluation-util')(errors);

    before(dbTestUtil.setUpDb);

    after(dbTestUtil.tearDownDb);

    beforeEach(function (done) {
        exampleUsers = generateExampleUsers();
        exampleMovies = generateExampleMovies();
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
                var transformedUser = result.toObject();
                transformedUser.should.have.ownProperty('lastModified');
                done();
            });
        });

    });

});