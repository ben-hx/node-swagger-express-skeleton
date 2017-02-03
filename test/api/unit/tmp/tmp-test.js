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
            MovieUserAction.remove(),
        ]).then(function () {
            done();
        });
    });

    describe('filter by title and check population of subdocuments', function () {

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
                done();
            });
        });

        it('should return movie searched by title inclusive subdocuments (userWatched, userRanking)', function (done) {
            var options = {
                query: {
                    title: exampleMovies.theToxicAvenger.title
                }
            };
            movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                result.movies[0].userWatched[0].user._id.equals(exampleUsers.alice._id).should.be.true;
                result.movies[0].userRatings[0].user._id.equals(exampleUsers.alice._id).should.be.true;
                done();
            });
        });

    });
});
