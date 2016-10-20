'use strict';
var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/user");
var Movie = require("../../../../models/movie");
var testUtil = require("../helpers/test-util");


describe('Movie-Endpoint Tests', function () {

    before(function (done) {
        User.collection.drop(function () {
            testUtil.registerExampleUser(testUtil.exampleUsers.bob, function () {
                testUtil.registerExampleUser(testUtil.exampleUsers.alice, done);
            });
        });
    });

    beforeEach(function (done) {
        Movie.collection.drop(function () {
            done();
        });
    });

    after(function (done) {
        Movie.collection.drop(function () {
            done();
        });
    });

    afterEach(function (done) {
        Movie.collection.drop(function () {
            done();
        });
    });

    describe('POST /movies', function () {

        describe('logged in', function () {
            it('should return a movie when posting valid movie-data', function (done) {
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                    testUtil.evaluateSuccessfulMovieResponse(res, 201, testUtil.exampleMovies.theToxicAvenger);
                    done();
                });
            });

            it('should return a movie when posting minimal movie-data', function (done) {
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvengerMinimal, function (err, res) {
                    testUtil.evaluateSuccessfulMovieResponse(res, 201, testUtil.exampleMovies.theToxicAvengerMinimal);
                    done();
                });
            });

            it('should return a bad-request when posting invalid movie-data', function (done) {
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvengerInvalid, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 400);
                    done();
                });
            });
        });

        describe('not logged in', function () {

            it('should return unauthorized when posting a movie with unposted user', function (done) {
                testUtil.postExampleMovie(testUtil.exampleUsers.unpostedUser, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });
    });



    describe('GET /movies', function() {

        describe('logged in', function() {

            it('should return posted movies',function(done){
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                    testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvengerUpdated, function (err, res) {
                        testUtil.getExampleMovies(testUtil.exampleUsers.bob, {}, function(err, res) {
                            testUtil.evaluateSuccessfulMoviesResponse(res, 200, [
                                testUtil.exampleMovies.theToxicAvenger,
                                testUtil.exampleMovies.theToxicAvengerUpdated
                            ]);
                            done();
                        });
                    });
                });
            });

            it('should return movie searched by title',function(done){
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                    testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvengerUpdated, function (err, res) {
                        testUtil.getExampleMovies(testUtil.exampleUsers.bob, { titles: 'The Toxic Avenger!' }, function(err, res) {
                            testUtil.evaluateSuccessfulMoviesResponse(res, 200, [
                                testUtil.exampleMovies.theToxicAvengerUpdated
                            ]);
                            done();
                        });
                    });
                });
            });

            it('should return movies searched by title',function(done){
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                    testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvengerUpdated, function (err, res) {
                        testUtil.getExampleMovies(testUtil.exampleUsers.bob, { titles: 'The Toxic Aven' }, function(err, res) {
                            testUtil.evaluateSuccessfulMoviesResponse(res, 200, [
                                testUtil.exampleMovies.theToxicAvenger,
                                testUtil.exampleMovies.theToxicAvengerUpdated
                            ]);
                            done();
                        });
                    });
                });
            });



            /*

            Add more filters here11!

             */




            it('should return no movie after deletion',function(done){
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                    var id = res.body.data._id;
                    testUtil.deleteExampleMovie(testUtil.exampleUsers.bob, id, function (err, res) {
                        testUtil.getExampleMovies(testUtil.exampleUsers.bob, {}, function(err, res) {
                            testUtil.evaluateSuccessfulMoviesResponse(res, 200, [
                            ]);
                            done();
                        });
                    });
                });
            });

        });

        describe('not logged in', function() {

            it('should return unauthorized when getting movies from unposted user', function (done) {
                var id = 123;
                testUtil.getExampleMovies(testUtil.exampleUsers.unpostedUser, {}, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

    describe('GET /movies/:movie_id', function () {

        describe('logged in', function () {

            it('should return a movie when getting by valid movie_id', function (done) {
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                    var id = res.body.data._id;
                    testUtil.getExampleMovie(testUtil.exampleUsers.bob, id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieResponse(res, 200, testUtil.exampleMovies.theToxicAvenger);
                        done();
                    });
                });
            });

            it('should return a bad-request when getting with invalid move_id', function (done) {
                var id = 123;
                testUtil.getExampleMovie(testUtil.exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not logged in', function() {

            it('should return unauthorized when getting a movie with unposted user', function (done) {
                var id = 123;
                testUtil.getExampleMovie(testUtil.exampleUsers.unpostedUser, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });
    });

    describe('PUT /movies/:movie_id', function () {

        describe('logged in', function () {

            it('should return a movie when putting a valid id and movie-data', function (done) {
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                    var id = res.body.data._id;
                    testUtil.putExampleMovie(testUtil.exampleUsers.bob, id, testUtil.exampleMovies.theToxicAvengerUpdated, function (err, res) {
                        testUtil.evaluateSuccessfulMovieResponse(res, 200, testUtil.exampleMovies.theToxicAvengerUpdated);
                        done();
                    });
                });
            });

            it('should return a bad-request when putting with invalid move_id', function (done) {
                var id = 123;
                testUtil.putExampleMovie(testUtil.exampleUsers.bob, id, testUtil.exampleMovies.theToxicAvengerUpdated, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not logged in', function() {

            it('should return unauthorized when putting a movie with unposted user', function (done) {
                var id = 123;
                testUtil.putExampleMovie(testUtil.exampleUsers.unpostedUser, id, testUtil.exampleMovies.theToxicAvengerUpdated, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });
    });

    describe('DELETE /movies/:movie_id', function () {

        describe('logged in', function () {

            it('should return a movie when deleting by valid movie_id', function (done) {
                testUtil.postExampleMovie(testUtil.exampleUsers.bob, testUtil.exampleMovies.theToxicAvenger, function (err, res) {
                    var id = res.body.data._id;
                    testUtil.deleteExampleMovie(testUtil.exampleUsers.bob, id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieResponse(res, 200, testUtil.exampleMovies.theToxicAvenger);
                        done();
                    });
                });
            });

            it('should return a bad-request when deleting by invalid move_id', function (done) {
                var id = 123;
                testUtil.deleteExampleMovie(testUtil.exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not logged in', function() {

            it('should return unauthorized when deleting a movie with unposted user', function (done) {
                var id = 123;
                testUtil.deleteExampleMovie(testUtil.exampleUsers.unpostedUser, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });
    });


});
