'use strict';
var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/user");
var Movie = require("../../../../models/movie");
var testUtil = require("../helpers/test-util");
var exampleUsers = require("../helpers/exampleUsers");
var exampleMovies = require("../helpers/examleMovies");


describe('Movie-Property-Endpoint Tests', function () {

    var movieProperties = [
        'genres',
        'directors',
        'writers',
        'actors',
        'languages'
    ];

    before(function (done) {
        User.collection.drop(function () {
            testUtil.registerExampleUser(exampleUsers.bob, function () {
                testUtil.registerExampleUser(exampleUsers.alice, done);
            });
        });
    });

    beforeEach(function (done) {
        Movie.collection.drop(function () {
            done();
        });
    });

    after(function (done) {
        User.collection.drop(function () {
            done();
        });
    });

    afterEach(function (done) {
        Movie.collection.drop(function () {
            done();
        });
    });


    for (var i = 0; i < movieProperties.length; ++i) {
        testForMovieProperty(movieProperties[i]);
    }
    
    function testForMovieProperty(propertyName) {

        describe('GET /movies/'+propertyName, function () {

            describe('logged in', function () {

                function postMovieArray(user, movies, done) {
                    var movieCount = movies.length;
                    var isFinished = false;
                    for (var i = 0; i < movies.length; ++i) {
                        testUtil.postExampleMovie(user, movies[i], function (err, res) {
                            if (isFinished) {
                                return;
                            }
                            if (err) {
                                isFinished = true;
                                return done(err);
                            }
                            --movieCount || done();
                        });
                    }
                }

                it('should return posted '+propertyName+' of no movie', function (done) {
                    testUtil.getMovieProperty(propertyName, exampleUsers.bob, function (err, res) {
                        testUtil.evaluateSuccessfulMoviePropertyResponse(propertyName, res, 200, []);
                        done();
                    });
                });

                it('should return posted '+propertyName+' of one movie', function (done) {
                    postMovieArray(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger
                    ], function (err) {
                        testUtil.getMovieProperty(propertyName, exampleUsers.bob, function (err, res) {
                            testUtil.evaluateSuccessfulMoviePropertyResponse(propertyName, res, 200, exampleMovies.theToxicAvenger[propertyName]);
                            done();
                        });
                    });
                });

                it('should return posted '+propertyName+' of more than one movie', function (done) {
                    postMovieArray(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.returnOfTheKillerTomatos
                    ], function (err) {
                        testUtil.getMovieProperty(propertyName, exampleUsers.bob, function (err, res) {
                            var values = exampleMovies.theToxicAvenger[propertyName].concat(exampleMovies.returnOfTheKillerTomatos[propertyName]);
                            testUtil.evaluateSuccessfulMoviePropertyResponse(propertyName, res, 200, values);
                            done();
                        });
                    });
                });

            });

            describe('not logged in', function () {

                it('should return unauthorized when getting genres from unposted user', function (done) {
                    testUtil.getMovieProperty(propertyName, exampleUsers.unpostedUser, function (err, res) {
                        testUtil.evaluateErrorResponse(res, 401);
                        done();
                    });
                });
            });

        });
    }

});
