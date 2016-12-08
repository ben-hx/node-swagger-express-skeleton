'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Movie-Repository-CRUD-Tests', function () {

    var mongoose = require('mongoose');
    var User = require("../../../../../models/user");
    var InaktiveUser = require("../../../../../models/inaktive-user");
    var Movie = require("../../../../../models/movie");

    var testFactory = require("../../../helpers/test-factory")();
    var config = testFactory.config;
    var exampleUsers = testFactory.exampleData.generateUsers();
    var exampleMovies = testFactory.exampleData.generateMovies();
    var dbTestUtil = testFactory.dbTestUtil();
    var movieTestUtil = testFactory.movieTestUtil();
    var movieRepositoryTestUtil = testFactory.movieTestUtil().repositoryDecorator;
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

    describe('create()', function () {

        it('should return a movie when creating with valid movie-data', function (done) {
            movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                done();
            });
        });

        it('should return a movie when creating minimal movie-data', function (done) {
            movieRepositoryTestUtil.create(exampleMovies.theToxicAvengerMinimal, exampleUsers.bob).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvengerMinimal);
                done();
            });
        });

        it('should return an error when creating two movies with the same title', function (done) {
            movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, exampleUsers.bob).then(function (result) {
                return movieRepositoryTestUtil.create(exampleMovies.theToxicAvengerSame, exampleUsers.bob);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done()
            });
        });

        it('should return an error when creating invalid movie-data', function (done) {
            movieRepositoryTestUtil.create(exampleMovies.theToxicAvengerInvalid, exampleUsers.bob).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done()
            });
        });

        it('should return an error when creating invalid user', function (done) {
            movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, {}).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done()
            });
        });

    });

    describe('getAll()', function () {

        beforeEach(function (done) {
            q.all([
                movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, exampleUsers.bob),
                movieRepositoryTestUtil.create(exampleMovies.theToxicAvengerUpdated, exampleUsers.alice),
                movieRepositoryTestUtil.create(exampleMovies.returnOfTheKillerTomatos, exampleUsers.eve)
            ]).then(function () {
                done();
            });
        });

        describe('no filter', function () {

            it('should return movies when getting all', function (done) {
                movieRepositoryTestUtil.getAll().then(function (result) {
                    var expected = [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated,
                        exampleMovies.returnOfTheKillerTomatos
                    ];
                    movieEvaluation.evaluateMovies(result.movies, expected);
                    done();
                });
            });

            it('should return a default pagination when getting all', function (done) {
                movieRepositoryTestUtil.getAll().then(function () {
                    return movieRepositoryTestUtil.getAll();
                }).then(function (result) {
                    result.movies.should.have.length(3);
                    result.pagination.page.should.equal(0);
                    result.pagination.limit.should.equal(config[process.env.NODE_ENV].settings.movie.moviesPerPageDefault);
                    result.pagination.totalCount.should.equal(3);
                    result.pagination.totalPages.should.equal(1);
                    done();
                });
            });

        });

        describe('filter by title', function () {

            it('should return movie searched by exactly the title', function (done) {
                var options = {
                    query: {
                        title: exampleMovies.returnOfTheKillerTomatos.title
                    }
                };
                movieRepositoryTestUtil.getAll(options).then(function (result) {
                    var expected = [
                        exampleMovies.returnOfTheKillerTomatos
                    ];
                    movieEvaluation.evaluateMovies(result.movies, expected);
                    done();
                });
            });

            it('should return movies searched by the beginning of the title', function (done) {
                var options = {
                    query: {
                        title: 'The Toxic'
                    }
                };
                movieRepositoryTestUtil.getAll(options).then(function (result) {
                    var expected = [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ];
                    movieEvaluation.evaluateMovies(result.movies, expected);
                    done();
                });
            });

            describe('filter by actor', function () {

                it('should return movie searched by exactly the actor', function (done) {
                    var options = {
                        query: {
                            actors: 'Mitch Cohen'
                        }
                    };
                    movieRepositoryTestUtil.getAll(options).then(function (result) {
                        var expected = [
                            exampleMovies.theToxicAvenger
                        ];
                        movieEvaluation.evaluateMovies(result.movies, expected);
                        done();
                    });
                });

                it('should return movies searched by the beginning of the actor', function (done) {
                    var options = {
                        query: {
                            actors: 'Andree'
                        }
                    };
                    movieRepositoryTestUtil.getAll(options).then(function (result) {
                        var expected = [
                            exampleMovies.theToxicAvenger,
                            exampleMovies.theToxicAvengerUpdated
                        ];
                        movieEvaluation.evaluateMovies(result.movies, expected);
                        done();
                    });
                });

            });

            describe('filter by year', function () {

                it('should return movie searched by year', function (done) {
                    var options = {
                        query: {
                            years: 1984
                        }
                    };
                    movieRepositoryTestUtil.getAll(options).then(function (result) {
                        var expected = [
                            exampleMovies.theToxicAvenger
                        ];
                        movieEvaluation.evaluateMovies(result.movies, expected);
                        done();
                    });
                });

                it('should return movies searched by year array', function (done) {
                    var options = {
                        query: {
                            years: [1984, 1983]
                        }
                    };
                    movieRepositoryTestUtil.getAll(options).then(function (result) {
                        var expected = [
                            exampleMovies.theToxicAvenger,
                            exampleMovies.theToxicAvengerUpdated
                        ];
                        movieEvaluation.evaluateMovies(result.movies, expected);
                        done();
                    });
                });

                describe('filter by genres', function () {

                    it('should return movie searched by genre', function (done) {
                        var options = {
                            query: {
                                genres: 'Action'
                            }
                        };
                        movieRepositoryTestUtil.getAll(options).then(function (result) {
                            var expected = [
                                exampleMovies.theToxicAvenger
                            ];
                            movieEvaluation.evaluateMovies(result.movies, expected);
                            done();
                        });
                    });

                    it('should return movies searched by genre array', function (done) {
                        var options = {
                            query: {
                                genres: ['Comedy', 'Horror']
                            }
                        };
                        movieRepositoryTestUtil.getAll(options).then(function (result) {
                            var expected = [
                                exampleMovies.theToxicAvenger,
                                exampleMovies.theToxicAvengerUpdated,
                                exampleMovies.returnOfTheKillerTomatos
                            ];
                            movieEvaluation.evaluateMovies(result.movies, expected);
                            done();
                        });
                    });

                });

                describe('filter by lastModifiedUser', function () {

                    it('should return movie searched by lastModifiedUser', function (done) {
                        var options = {
                            query: {
                                lastModifiedUser: exampleUsers.alice._id
                            }
                        };
                        movieRepositoryTestUtil.getAll(options).then(function (result) {
                            var expected = [
                                exampleMovies.theToxicAvengerUpdated
                            ];
                            movieEvaluation.evaluateMovies(result.movies, expected);
                            done();
                        });
                    });

                    it('should return movies searched by lastModifiedUser array', function (done) {
                        var options = {
                            query: {
                                lastModifiedUser: [exampleUsers.alice._id, exampleUsers.bob._id]
                            }
                        };
                        movieRepositoryTestUtil.getAll(options).then(function (result) {
                            var expected = [
                                exampleMovies.theToxicAvenger,
                                exampleMovies.theToxicAvengerUpdated
                            ];
                            movieEvaluation.evaluateMovies(result.movies, expected);
                            done();
                        });
                    });

                });

            });

        });

    });

    describe('getById()', function () {

        it('should return a movie when getting by valid movie_id', function (done) {
            q.all([
                movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, exampleUsers.bob)
            ]).then(function () {
                return movieRepositoryTestUtil.getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                done();
            });
        });

        it('should return a not-found-error when getting with invalid move_id', function (done) {
            movieRepositoryTestUtil.getById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });
    });

    describe('updateById()', function () {

        it('should return a movie when updating with movie-data', function (done) {
            q.all([
                movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, exampleUsers.bob)
            ]).then(function () {
                exampleMovies.theToxicAvenger.title = "theToxicAvengerUpdated";
                return movieRepositoryTestUtil.updateById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger, exampleUsers.bob);
            }).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                done();
            });
        });

        it('should return a movie when updating nothing', function (done) {
            q.all([
                movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, exampleUsers.bob)
            ]).then(function () {
                return movieRepositoryTestUtil.updateById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger, exampleUsers.bob);
            }).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                done();
            });
        });


        it('should return an error when updating a movie with title that already exists', function (done) {
            q.all([
                movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, exampleUsers.bob),
                movieRepositoryTestUtil.create(exampleMovies.returnOfTheKillerTomatos, exampleUsers.bob)
            ]).then(function () {
                exampleMovies.returnOfTheKillerTomatos.title = exampleMovies.theToxicAvenger.title;
                return movieRepositoryTestUtil.updateById(exampleMovies.returnOfTheKillerTomatos._id, exampleMovies.returnOfTheKillerTomatos, exampleUsers.bob);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when updating without valid user', function (done) {
            q.all([
                movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, exampleUsers.bob),
                movieRepositoryTestUtil.create(exampleMovies.returnOfTheKillerTomatos, exampleUsers.bob)
            ]).then(function () {
                return movieRepositoryTestUtil.updateById(exampleMovies.returnOfTheKillerTomatos._id, exampleMovies.returnOfTheKillerTomatos, {});
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when updating with invalid movie-data', function (done) {
            movieRepositoryTestUtil.updateById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger, exampleUsers.bob).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteById()', function () {

        it('should return a movie when deleting with valid id', function (done) {
            q.all([
                movieRepositoryTestUtil.create(exampleMovies.theToxicAvenger, exampleUsers.bob)
            ]).then(function () {
                return movieRepositoryTestUtil.deleteById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                done();
            });
        });

        it('should return an error when deleting with invalid id', function (done) {
            movieRepositoryTestUtil.deleteById(exampleMovies.theToxicAvenger._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

});