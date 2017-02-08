'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Movie-Rating-Model-Tests', function () {

    var mongoose = require('mongoose');
    var User = require("../../../../models/user");
    var Movie = require("../../../../models/movie");
    var MovieUserAction = require("../../../../models/movie-user-action");

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
            MovieUserAction.remove(),
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            MovieUserAction.remove()
        ]).then(function () {
            done();
        });
    });

    describe('save() - general', function () {

        it('should return a movie-action when saving movie action', function (done) {
            var movieActions = new MovieUserAction({movie: exampleMovies.theToxicAvenger, watched: [], ratings: []});
            movieActions.save().then(function (result) {
                result.movie.equals(exampleMovies.theToxicAvenger._id).should.be.true;
                result.ratings.should.be.empty;
                result.watched.should.be.empty;
                done();
            });
        });

    });

    describe('save() - watched', function () {

        it('should return a movie-action when saving movie action', function (done) {
            var movieActions = new MovieUserAction({movie: exampleMovies.theToxicAvenger, watched: [], ratings: []});
            movieActions.save().then(function (result) {
                movieActions.watched.addToSet({user: exampleUsers.bob});
                movieActions.watched.addToSet({user: exampleUsers.eve});
                movieActions.watched.addToSet({user: exampleUsers.alice});
                return movieActions.save();
            }).then(function (result) {
                result = result.toObject();
                result.watched[0].user.equals(exampleUsers.bob._id).should.be.true;
                result.watched[1].user.equals(exampleUsers.eve._id).should.be.true;
                result.watched[2].user.equals(exampleUsers.alice._id).should.be.true;
                result.watched.forEach(function (watchedValue) {
                    watchedValue.should.have.ownProperty('date');
                });
                done();
            })
        });

    });

    describe('save() - ratings', function () {

        it('should return a movie-action when saving movie action', function (done) {
            var movieActions = new MovieUserAction({movie: exampleMovies.theToxicAvenger, watched: [], ratings: []});
            movieActions.save().then(function (result) {
                movieActions.ratings.addToSet({user: exampleUsers.bob, value: 1});
                return movieActions.save();
            }).then(function (result) {
                result = result.toObject();
                result.ratings[0].user.equals(exampleUsers.bob._id).should.be.true;
                result.ratings[0].value.should.equal(1);
                result.ratings.forEach(function (ratingsValue) {
                    ratingsValue.should.have.ownProperty('date');
                });
                done();
            });
        });

        it('should return an error when saving invalid rating lower than 0', function (done) {
            var movieActions = new MovieUserAction({movie: exampleMovies.theToxicAvenger, watched: [], ratings: []});
            movieActions.save().then(function (result) {
                movieActions.ratings.addToSet({user: exampleUsers.bob, value: -1});
                return movieActions.save();
            }).catch(function (error) {
                done();
            });
        });

        it('should return an error when saving invalid rating greater than 10', function (done) {
            var movieActions = new MovieUserAction({movie: exampleMovies.theToxicAvenger, watched: [], ratings: []});
            movieActions.save().then(function (result) {
                movieActions.ratings.addToSet({user: exampleUsers.bob, value: 11});
                return movieActions.save();
            }).catch(function (error) {
                done();
            });
        });

    });

    describe('save() - comments', function () {

        it('should return a movie-action when saving movie action', function (done) {
            var movieActions = new MovieUserAction({movie: exampleMovies.theToxicAvenger, watched: [], ratings: []});
            movieActions.save().then(function (result) {
                movieActions.comments.addToSet({user: exampleUsers.bob, text: "bob"});
                movieActions.comments.addToSet({user: exampleUsers.eve, text: "eve"});
                movieActions.comments.addToSet({user: exampleUsers.alice, text: "alice"});
                return movieActions.save();
            }).then(function (result) {
                result = result.toObject();
                result.comments[0].user.equals(exampleUsers.bob._id).should.be.true;
                result.comments[0].text.should.equal("bob");
                result.comments[1].user.equals(exampleUsers.eve._id).should.be.true;
                result.comments[1].text.should.equal("eve");
                result.comments[2].user.equals(exampleUsers.alice._id).should.be.true;
                result.comments[2].text.should.equal("alice");
                result.watched.forEach(function (watchedValue) {
                    watchedValue.should.have.ownProperty('date');
                });
                done();
            })
        });

    });

});