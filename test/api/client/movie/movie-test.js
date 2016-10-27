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


describe('Movie-Endpoint Tests', function () {

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

    describe('POST /movies', function () {

        describe('logged in', function () {
            it('should return a movie when posting valid movie-data', function (done) {
                testUtil.postExampleMovie(exampleUsers.bob, exampleMovies.theToxicAvenger, function (err, res) {
                    testUtil.evaluateSuccessfulMovieResponse(res, 201, exampleMovies.theToxicAvenger, exampleUsers.bob);
                    done();
                });
            });

            it('should return a movie when posting minimal movie-data', function (done) {
                testUtil.postExampleMovie(exampleUsers.bob, exampleMovies.theToxicAvengerMinimal, function (err, res) {
                    testUtil.evaluateSuccessfulMovieResponse(res, 201, exampleMovies.theToxicAvengerMinimal, exampleUsers.bob);
                    done();
                });
            });

            it('should return a bad-request when posting invalid movie-data', function (done) {
                testUtil.postExampleMovie(exampleUsers.bob, exampleMovies.theToxicAvengerInvalid, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 400);
                    done();
                });
            });
        });

        describe('not logged in', function () {

            it('should return unauthorized when posting a movie with unposted user', function (done) {
                testUtil.postExampleMovie(exampleUsers.unpostedUser, exampleMovies.theToxicAvenger, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });
    });


    describe('GET /movies', function () {

        describe('logged in', function () {

            function evaluateGetMoviesByParam(user, movies2post, param, movies2get, done) {
                postMovieArray(user, movies2post, function (err) {
                    testUtil.getExampleMovies(user, param, function (err, res) {
                        testUtil.evaluateSuccessfulMoviesResponse(res, 200, movies2get);
                        done();
                    });
                });
            }

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

            describe('no filter', function () {

                it('should return posted movies', function (done) {
                    evaluateGetMoviesByParam(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], {}, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], done);
                });

            });

            describe('filter by title', function () {

                it('should return movie searched by exactly the title', function (done) {
                    evaluateGetMoviesByParam(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], {title: 'The Toxic Avenger!'}, [
                        exampleMovies.theToxicAvengerUpdated
                    ], done);
                });

                it('should return movies searched by the beginning of the title', function (done) {
                    evaluateGetMoviesByParam(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], {title: 'The Toxic Aven'}, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], done);
                });

            });

            describe('filter by actor', function () {

                it('should return movie searched by exactly the actor', function (done) {
                    evaluateGetMoviesByParam(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], {actors: 'Mitch Cohen'}, [
                        exampleMovies.theToxicAvenger
                    ], done);
                });

                it('should return movies searched by the beginning of the actor', function (done) {
                    evaluateGetMoviesByParam(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], {actors: 'Andree'}, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], done);
                });

            });

            describe('filter by year', function () {

                it('should return movie searched by year', function (done) {
                    evaluateGetMoviesByParam(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], {years: 1984}, [
                        exampleMovies.theToxicAvenger
                    ], done);
                });

                it('should return movies searched by year array', function (done) {
                    evaluateGetMoviesByParam(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], {years: [1984, 1983]}, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], done);
                });

            });

            describe('filter by genres', function () {

                it('should return movie searched by genre', function (done) {
                    evaluateGetMoviesByParam(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], {genres: 'Action'}, [
                        exampleMovies.theToxicAvenger
                    ], done);
                });

                it('should return movies searched by year array', function (done) {
                    evaluateGetMoviesByParam(exampleUsers.bob, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], {genres: ['Comedy', 'Horror']}, [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ], done);
                });

            });

            describe('filter by userIds', function () {

                it('should return movie searched by userId', function (done) {
                    postMovieArray(exampleUsers.alice, [
                        exampleMovies.theToxicAvenger
                    ], function (err) {
                        evaluateGetMoviesByParam(exampleUsers.bob, [
                            exampleMovies.theToxicAvengerUpdated,
                        ], {userCreatedIds: exampleUsers.bob._id}, [
                            exampleMovies.theToxicAvengerUpdated
                        ], done);
                    });
                });

                it('should return movies searched by userId array', function (done) {
                    postMovieArray(exampleUsers.alice, [
                        exampleMovies.theToxicAvenger
                    ], function (err) {
                        evaluateGetMoviesByParam(exampleUsers.bob, [
                            exampleMovies.theToxicAvengerUpdated,
                        ], {userCreatedIds: [exampleUsers.alice._id, exampleUsers.bob._id]}, [
                            exampleMovies.theToxicAvenger,
                            exampleMovies.theToxicAvengerUpdated
                        ], done);
                    });
                });

            });

            it('should return no movie after deletion', function (done) {
                testUtil.postExampleMovie(exampleUsers.bob, exampleMovies.theToxicAvenger, function (err, res) {
                    var id = res.body.data.movie._id;
                    testUtil.deleteExampleMovie(exampleUsers.bob, id, function (err, res) {
                        testUtil.getExampleMovies(exampleUsers.bob, {}, function (err, res) {
                            testUtil.evaluateSuccessfulMoviesResponse(res, 200, []);
                            done();
                        });
                    });
                });
            });

        });

        describe('not logged in', function () {

            it('should return unauthorized when getting movies from unposted user', function (done) {
                testUtil.getExampleMovies(exampleUsers.unpostedUser, {}, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

    describe('GET /movies/:movie_id', function () {

        describe('logged in', function () {

            it('should return a movie when getting by valid movie_id', function (done) {
                testUtil.postExampleMovie(exampleUsers.bob, exampleMovies.theToxicAvenger, function (err, res) {
                    var id = res.body.data.movie._id;
                    testUtil.getExampleMovie(exampleUsers.bob, id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieResponse(res, 200, exampleMovies.theToxicAvenger, exampleUsers.bob);
                        done();
                    });
                });
            });

            it('should return a not-found when getting with invalid move_id', function (done) {
                var id = 123;
                testUtil.getExampleMovie(exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not logged in', function () {

            it('should return unauthorized when getting a movie with unposted user', function (done) {
                var id = 123;
                testUtil.getExampleMovie(exampleUsers.unpostedUser, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });
    });

    describe('PUT /movies/:movie_id', function () {

        describe('logged in', function () {

            it('should return a movie when putting a valid id and movie-data', function (done) {
                testUtil.postExampleMovie(exampleUsers.bob, exampleMovies.theToxicAvenger, function (err, res) {
                    var id = res.body.data.movie._id;
                    testUtil.putExampleMovie(exampleUsers.bob, id, exampleMovies.theToxicAvengerUpdated, function (err, res) {
                        testUtil.evaluateSuccessfulMovieResponse(res, 200, exampleMovies.theToxicAvengerUpdated, exampleUsers.bob);
                        done();
                    });
                });
            });

            it('should return a bad-request when putting with invalid move_id', function (done) {
                var id = 123;
                testUtil.putExampleMovie(exampleUsers.bob, id, exampleMovies.theToxicAvengerUpdated, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not logged in', function () {

            it('should return unauthorized when putting a movie with unposted user', function (done) {
                var id = 123;
                testUtil.putExampleMovie(exampleUsers.unpostedUser, id, exampleMovies.theToxicAvengerUpdated, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });
    });

    describe('DELETE /movies/:movie_id', function () {

        describe('logged in', function () {

            it('should return a movie when deleting by valid movie_id', function (done) {
                testUtil.postExampleMovie(exampleUsers.bob, exampleMovies.theToxicAvenger, function (err, res) {
                    var id = res.body.data.movie._id;
                    testUtil.deleteExampleMovie(exampleUsers.bob, id, function (err, res) {
                        testUtil.evaluateSuccessfulMovieResponse(res, 200, exampleMovies.theToxicAvenger, exampleUsers.bob);
                        done();
                    });
                });
            });

            it('should return a bad-request when deleting by invalid move_id', function (done) {
                var id = 123;
                testUtil.deleteExampleMovie(exampleUsers.bob, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not logged in', function () {

            it('should return unauthorized when deleting a movie with unposted user', function (done) {
                var id = 123;
                testUtil.deleteExampleMovie(exampleUsers.unpostedUser, id, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });
    });

});
