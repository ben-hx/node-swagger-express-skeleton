'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Movie-Repository-CRUD-Tests', function () {

    var mongoose = require('mongoose');
    var User = require("../../../../models/user");
    var InaktiveUser = require("../../../../models/inaktive-user");
    var Movie = require("../../../../models/movie");
    var MovieUserAction = require("../../../../models/movie-user-action");

    var testFactory = require("../../helpers/test-factory")();
    var config = testFactory.config;
    var exampleUsers = testFactory.exampleData.generateUsers();
    var exampleMovies = testFactory.exampleData.generateMovies();
    var dbTestUtil = testFactory.dbTestUtil();
    var movieTestUtil = testFactory.movieTestUtil();
    var movieRepository = testFactory.movieTestUtil().repository;
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
            MovieUserAction.remove(),
            userTestUtil.saveExampleUser(exampleUsers.bob),
            userTestUtil.saveExampleUser(exampleUsers.alice),
            userTestUtil.saveExampleUser(exampleUsers.eve)
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            User.remove(),
            Movie.remove(),
            MovieUserAction.remove()
        ]).then(function () {
            done();
        });
    });

    describe('temp', function () {

        beforeEach(function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger),
                movieRepository.forUser(exampleUsers.alice).create(exampleMovies.theToxicAvengerUpdated),
                movieRepository.forUser(exampleUsers.eve).create(exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                return movieRepository.forUser(exampleUsers.bob).setWatchedById(exampleMovies.theToxicAvenger._id);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.alice).setWatchedById(exampleMovies.theToxicAvenger._id);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.eve).setWatchedById(exampleMovies.theToxicAvenger._id);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.bob).setRatingById(exampleMovies.theToxicAvenger._id, 5);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.alice).setRatingById(exampleMovies.theToxicAvenger._id, 4);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.eve).setRatingById(exampleMovies.theToxicAvenger._id, 4);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.bob).setWatchedById(exampleMovies.returnOfTheKillerTomatos._id);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.alice).setWatchedById(exampleMovies.returnOfTheKillerTomatos._id);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.eve).setWatchedById(exampleMovies.returnOfTheKillerTomatos._id);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.bob).setRatingById(exampleMovies.returnOfTheKillerTomatos._id, 10);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.alice).setRatingById(exampleMovies.returnOfTheKillerTomatos._id, 9);
            }).then(function () {
                return movieRepository.forUser(exampleUsers.eve).setRatingById(exampleMovies.returnOfTheKillerTomatos._id, 8);
            }).then(function () {
                done();
            });
        });

        it('tmp', function (done) {
            done();
        });

    });
});
