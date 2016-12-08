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

    describe('tmp', function () {

        it('should fucking work!!!', function (done) {
            var movieActions = new MovieUserAction({movie: exampleMovies.theToxicAvenger, watched: [], ratings: []});
            movieActions.save().then(function (result) {
                //movieActions.watched.addToSet({user: exampleUsers.bob});
                movieActions.watched.addToSet({user: exampleUsers.eve});
                movieActions.watched.addToSet({user: exampleUsers.alice});
                return movieActions.save();
            }).then(function (result) {
                var movieAction =  MovieUserAction({movie: exampleMovies.returnOfTheKillerTomatos, watched: [], ratings: []});
                return movieAction.save();
            }).then(function (result) {

                /*
                 return MovieUserAction.find().populate(
                 {
                 path: 'watched.user',
                 match: {_id: exampleUsers.bob._id},
                 model: 'User'
                 }
                 );
                 */
                //return MovieUserAction.find({'user': {$elemMatch: {'username': 'bob'}}}).exec();

                return MovieUserAction
                    .find({movie: exampleMovies.theToxicAvenger._id})
                    .where('watched.user', exampleUsers.bob._id)
                    //.select({'watched.$': 1})
                    .populate('movie watched.user ratings.user');
                /*
                 .populate(
                 [
                 {
                 path: 'watched.user',
                 model: 'User'
                 },
                 {
                 path: 'movie'

                 }
                 ]
                 );
                 */
            }).then(function (result) {
                console.log(result);
                done();
            }).catch(function (error) {
                console.log(error);
            });
        });
    });


});