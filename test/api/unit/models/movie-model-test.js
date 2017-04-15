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
            userTestUtil.saveExampleUser(exampleUsers.eve)
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

    describe('save() - userActions', function () {

        it('should return a movie with empty userAction-arrays when saving movie-data', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                result.ratings.should.be.empty;
                result.watched.should.be.empty;
                result.comments.should.be.empty;
                done();
            });
        });

    });

    describe('save() - watched', function () {

        it('should return a movie when saving movie with watched', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                result.watched.addToSet({user: exampleUsers.bob});
                result.watched.addToSet({user: exampleUsers.eve});
                result.watched.addToSet({user: exampleUsers.alice});
                return result.save();
            }).then(function (result) {
                result = result.toObject();
                result.watched[0].user.equals(exampleUsers.bob._id).should.be.true;
                result.watched[1].user.equals(exampleUsers.eve._id).should.be.true;
                result.watched[2].user.equals(exampleUsers.alice._id).should.be.true;
                result.watched.forEach(function (watchedValue) {
                    watchedValue.should.have.ownProperty('date');
                });
                done();
            });
        });

    });

    describe('save() - ratings', function () {

        it('should return a movie when saving movie with ratings', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                result.ratings.addToSet({user: exampleUsers.bob, value: 1});
                return result.save();
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
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                result.ratings.addToSet({user: exampleUsers.bob, value: -1});
                return result.save();
            }).catch(function (error) {
                done();
            });
        });

        it('should return an error when saving invalid rating greater than 10', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                result.ratings.addToSet({user: exampleUsers.bob, value: 11});
                return result.save();
            }).catch(function (error) {
                done();
            });
        });

    });

    describe('save() - comments', function () {

        it('should return a movie when saving movie with comment', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                result.comments.addToSet({user: exampleUsers.bob, text: "bob"});
                result.comments.addToSet({user: exampleUsers.eve, text: "eve"});
                result.comments.addToSet({user: exampleUsers.alice, text: "alice"});
                return result.save();
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

    describe('save() inclusive Plugin: toObjectTransformation', function () {

        it('should return a movie when saving with valid movie-data', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                movieEvaluation.evaluateMovie(result.toObject(), exampleMovies.theToxicAvenger);
                done();
            });
        });

        it('should return a movie when saving minimal movie-data', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvengerMinimal, exampleUsers.bob).then(function (result) {
                movieEvaluation.evaluateMinimalMovie(result.toObject(), exampleMovies.theToxicAvengerMinimal);
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

        it('should return an error when saving two movies with one containing the same title in titleAlias', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function () {
                exampleMovies.theToxicAvengerSame.title = "Toxie";
                exampleMovies.theToxicAvengerSame.titleAlias = [exampleMovies.theToxicAvenger.title];
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

    describe('Plugin: created', function () {

        it('should return a movie with created-field when inserting Object', function (done) {
            movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvengerMinimal, exampleUsers.bob).then(function (result) {
                var transformedObject = result.toObject();
                transformedObject.should.have.ownProperty('created');
                done();
            });
        });

    });

});