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

    describe('create()', function () {

        it('should return a movie when creating with valid movie-data', function (done) {
            movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                movieEvaluation.evaluateMovieWatched(result, {ownWatched: {value: false}, userWatched: []});
                movieEvaluation.evaluateMovieRating(result, {ownRating: null, userRatings: [], averageRating: null});
                done();
            });
        });

        it('should return a movie when creating minimal movie-data', function (done) {
            movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvengerMinimal).then(function (result) {
                movieEvaluation.evaluateMinimalMovie(result, exampleMovies.theToxicAvengerMinimal);
                movieEvaluation.evaluateMovieWatched(result, {ownWatched: {value: false}, userWatched: []});
                movieEvaluation.evaluateMovieRating(result, {ownRating: null, userRatings: [], averageRating: null});
                done();
            });
        });

        it('should return an error when creating two movies with the same title', function (done) {
            movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger).then(function (result) {
                return movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvengerSame);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done()
            });
        });

        it('should return an error when creating invalid movie-data', function (done) {
            movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvengerInvalid).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done()
            });
        });


    });

    describe('getAll()', function () {

        beforeEach(function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger),
                movieRepository.forUser(exampleUsers.alice).create(exampleMovies.theToxicAvengerUpdated),
                movieRepository.forUser(exampleUsers.eve).create(exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                done();
            });
        });

        describe('no filter', function () {

            it('should return movies when getting all', function (done) {
                movieRepository.forUser(exampleUsers.bob).getAll().then(function (result) {
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

        describe('no filter', function () {

            it('should return movies when getting all', function (done) {
                movieRepository.forUser(exampleUsers.bob).getAll().then(function (result) {
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
                movieRepository.forUser(exampleUsers.bob).getAll().then(function (result) {
                    result.movies.should.have.length(3);
                    result.pagination.page.should.equal(0);
                    result.pagination.limit.should.equal(config.settings.movie.moviesPerPageDefault);
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
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
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
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                    var expected = [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ];
                    movieEvaluation.evaluateMovies(result.movies, expected);
                    done();
                });
            });
        });

        describe('filter by actor', function () {

            it('should return movie searched by exactly the actor', function (done) {
                var options = {
                    query: {
                        actors: 'Mitch Cohen'
                    }
                };
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
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
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
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
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
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
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                    var expected = [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ];
                    movieEvaluation.evaluateMovies(result.movies, expected);
                    done();
                });
            });

        });

        describe('filter by genres', function () {

            it('should return movie searched by genre', function (done) {
                var options = {
                    query: {
                        genres: 'Action'
                    }
                };
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
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
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
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
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
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
                movieRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                    var expected = [
                        exampleMovies.theToxicAvenger,
                        exampleMovies.theToxicAvengerUpdated
                    ];
                    movieEvaluation.evaluateMovies(result.movies, expected);
                    done();
                });
            });

        });

        describe('filter by title and check population of subdocuments', function () {

            beforeEach(function (done) {
                movieRepository.forUser(exampleUsers.bob).setWatchedById(exampleMovies.returnOfTheKillerTomatos._id).then(function () {
                    return movieRepository.forUser(exampleUsers.alice).setWatchedById(exampleMovies.returnOfTheKillerTomatos._id);
                }).then(function () {
                    return movieRepository.forUser(exampleUsers.bob).setRatingById(exampleMovies.returnOfTheKillerTomatos._id, 5);
                }).then(function () {
                    return movieRepository.forUser(exampleUsers.alice).setRatingById(exampleMovies.returnOfTheKillerTomatos._id, 4);
                }).then(function () {
                    done();
                });
            });

            it('should return movie searched by title inclusive subdocuments (userWatched, userRanking)', function (done) {
                var options = {
                    query: {
                        title: exampleMovies.returnOfTheKillerTomatos.title
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

    describe('getById()', function () {

        it('should return a movie when getting by valid movie_id', function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger)
            ]).then(function () {
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                done();
            });
        });

        it('should return a not-found-error when getting with invalid move_id', function (done) {
            movieRepository.forUser(exampleUsers.bob).getById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('updateById()', function () {

        it('should return a movie when updating with movie-data', function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger)
            ]).then(function () {
                exampleMovies.theToxicAvenger.title = "theToxicAvengerUpdated";
                return movieRepository.forUser(exampleUsers.bob).updateById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger);
            }).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                done();
            });
        });

        it('should return a movie when updating nothing', function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger)
            ]).then(function () {
                return movieRepository.forUser(exampleUsers.bob).updateById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger);
            }).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                done();
            });
        });


        it('should return an error when updating a movie with title that already exists', function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger),
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                exampleMovies.returnOfTheKillerTomatos.title = exampleMovies.theToxicAvenger.title;
                return movieRepository.forUser(exampleUsers.bob).updateById(exampleMovies.returnOfTheKillerTomatos._id, exampleMovies.returnOfTheKillerTomatos);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when updating with invalid movie-data', function (done) {
            movieRepository.forUser(exampleUsers.bob).updateById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteById()', function () {

        it('should return a movie when deleting with valid id', function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger)
            ]).then(function () {
                return movieRepository.forUser(exampleUsers.bob).deleteById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                done();
            });
        });

        it('should return an error when deleting with invalid id', function (done) {
            movieRepository.forUser(exampleUsers.bob).deleteById(exampleMovies.theToxicAvenger._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('setWatchedById()', function () {

        beforeEach(function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger),
                movieRepository.forUser(exampleUsers.alice).create(exampleMovies.theToxicAvengerUpdated),
                movieRepository.forUser(exampleUsers.eve).create(exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                done();
            });
        });

        it('should return movie watched when setting the movie watched', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                movieEvaluation.evaluateMovieWatched(result, {ownWatched: {value: true}, userWatched: []});
                movieEvaluation.evaluateMovieRating(result, {ownRating: null, userRatings: [], averageRating: null});
            }

            movieRepository.forUser(exampleUsers.bob).setWatchedById(exampleMovies.theToxicAvenger._id).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return movie watched with other users watched when setting the movie watched', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                movieEvaluation.evaluateMovieWatched(result, {
                    ownWatched: {value: true},
                    userWatched: [exampleUsers.eve, exampleUsers.alice]
                });
                movieEvaluation.evaluateMovieRating(result, {ownRating: null, userRatings: [], averageRating: null});
            }

            movieRepository.forUser(exampleUsers.alice).setWatchedById(exampleMovies.theToxicAvenger._id).then(function () {
                return movieRepository.forUser(exampleUsers.eve).setWatchedById(exampleMovies.theToxicAvenger._id)
            }).then(function (result) {
                return movieRepository.forUser(exampleUsers.bob).setWatchedById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return an error when setting the movie watched a secound time', function (done) {
            movieRepository.forUser(exampleUsers.bob).setWatchedById(exampleMovies.theToxicAvenger._id).then(function () {
                return movieRepository.forUser(exampleUsers.bob).setWatchedById(exampleMovies.theToxicAvenger._id);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when setting the movie watched with invalid movie', function (done) {
            movieRepository.forUser(exampleUsers.bob).setWatchedById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteWatchedById()', function () {

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
                done();
            });
        });

        it('should return movie not watched when setting the movie unwatched', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                movieEvaluation.evaluateMovieWatched(result, {
                    ownWatched: {value: false},
                    userWatched: [exampleUsers.eve, exampleUsers.alice]
                });
                movieEvaluation.evaluateMovieRating(result, {ownRating: null, userRatings: [], averageRating: null});
            }

            movieRepository.forUser(exampleUsers.bob).deleteWatchedById(exampleMovies.theToxicAvenger._id).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return error when setting the movie unwatched with invalid movie', function (done) {
            movieRepository.forUser(exampleUsers.bob).deleteWatchedById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('setRatingById()', function () {

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
                done();
            });
        });

        it('should return movie rating when setting the movie rating', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                movieEvaluation.evaluateMovieWatched(result, {
                    ownWatched: {value: true},
                    userWatched: [exampleUsers.eve, exampleUsers.alice]
                });
                movieEvaluation.evaluateMovieRating(result, {
                    ownRating: {value: 4},
                    userRatings: [],
                    averageRating: 4
                });
            }

            movieRepository.forUser(exampleUsers.bob).setRatingById(exampleMovies.theToxicAvenger._id, 4).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return movie rated with other users rating when setting the movie rating', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovieWatched(result, {
                    ownWatched: {value: true},
                    userWatched: [exampleUsers.eve, exampleUsers.alice]
                });
                movieEvaluation.evaluateMovieRating(result, {
                    ownRating: {value: 3},
                    userRatings: [{user: exampleUsers.alice, value: 4}, {user: exampleUsers.eve, value: 2}],
                    averageRating: (4 + 2 + 3) / 3
                });
            }

            movieRepository.forUser(exampleUsers.alice).setRatingById(exampleMovies.theToxicAvenger._id, 4).then(function () {
                return movieRepository.forUser(exampleUsers.eve).setRatingById(exampleMovies.theToxicAvenger._id, 2)
            }).then(function (result) {
                return movieRepository.forUser(exampleUsers.bob).setRatingById(exampleMovies.theToxicAvenger._id, 3);
            }).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return movie rating when setting the movie rating a secound time', function (done) {
            function evaluateMovie(result) {
                movieEvaluation.evaluateMovieWatched(result, {
                    ownWatched: {value: true},
                    userWatched: [exampleUsers.eve, exampleUsers.alice]
                });
                movieEvaluation.evaluateMovieRating(result, {
                    ownRating: {value: 3},
                    userRatings: [{user: exampleUsers.alice, value: 4}],
                    averageRating: (4 + 3) / 2
                });
            }

            movieRepository.forUser(exampleUsers.alice).setRatingById(exampleMovies.theToxicAvenger._id, 4).then(function () {
                return movieRepository.forUser(exampleUsers.bob).setRatingById(exampleMovies.theToxicAvenger._id, 2)
            }).then(function (result) {
                return movieRepository.forUser(exampleUsers.bob).setRatingById(exampleMovies.theToxicAvenger._id, 3);
            }).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return an error when setting the movie rating with invalid movie', function (done) {
            movieRepository.forUser(exampleUsers.bob).setRatingById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), 4).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteRatingById()', function () {

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

        it('should return movie not rated when deleting the movie rating', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovieWatched(result, {
                    ownWatched: {value: true},
                    userWatched: [exampleUsers.eve, exampleUsers.alice]
                });
                movieEvaluation.evaluateMovieRating(result, {
                    ownRating: null,
                    userRatings: [{user: exampleUsers.alice, value: 4}, {user: exampleUsers.eve, value: 4}],
                    averageRating: (4 + 4) / 2
                });
            }

            movieRepository.forUser(exampleUsers.bob).deleteRatingById(exampleMovies.theToxicAvenger._id).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return error when setting the movie rating with invalid movie', function (done) {
            movieRepository.forUser(exampleUsers.bob).deleteRatingById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('addCommentById()', function () {

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
                done();
            });
        });

        it('should return movie comment when adding a comment to the movie', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                movieEvaluation.evaluateMovieComments(result, {userComments: [{user: exampleUsers.bob, text: "text"}]});
            }

            movieRepository.forUser(exampleUsers.bob).addCommentById(exampleMovies.theToxicAvenger._id, "text").then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return movie comments when adding comments to the movie', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                movieEvaluation.evaluateMovieComments(result, {
                    userComments: [{
                        user: exampleUsers.bob,
                        text: "bobText"
                    }, {
                        user: exampleUsers.alice,
                        text: "aliceText"
                    }]
                });
            }

            movieRepository.forUser(exampleUsers.bob).addCommentById(exampleMovies.theToxicAvenger._id, "bobText").then(function (result) {
                return movieRepository.forUser(exampleUsers.alice).addCommentById(exampleMovies.theToxicAvenger._id, "aliceText")
            }).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return movie comments when adding comments to the movie with the same user', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovie(result, exampleMovies.theToxicAvenger);
                movieEvaluation.evaluateMovieComments(result, {
                    userComments: [{
                        user: exampleUsers.bob,
                        text: "bobText1"
                    }, {
                        user: exampleUsers.bob,
                        text: "bobText2"
                    }]
                });
            }

            movieRepository.forUser(exampleUsers.bob).addCommentById(exampleMovies.theToxicAvenger._id, "bobText1").then(function (result) {
                return movieRepository.forUser(exampleUsers.bob).addCommentById(exampleMovies.theToxicAvenger._id, "bobText2")
            }).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return an error when adding comment to invalid movie', function (done) {
            movieRepository.forUser(exampleUsers.bob).addCommentById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), "asdf").catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteCommentFromUserById()', function () {

        beforeEach(function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger),
                movieRepository.forUser(exampleUsers.alice).create(exampleMovies.theToxicAvengerUpdated),
                movieRepository.forUser(exampleUsers.eve).create(exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                return movieRepository.forUser(exampleUsers.bob).addComment(exampleMovies.theToxicAvenger, "bobText");
            }).then(function () {
                return movieRepository.forUser(exampleUsers.alice).addComment(exampleMovies.theToxicAvenger, "aliceText");
            }).then(function () {
                return movieRepository.forUser(exampleUsers.eve).addComment(exampleMovies.theToxicAvenger, "eveText");
            }).then(function () {
                done();
            });
        });

        it('should return movie comments when deleting own comment', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovieComments(result, {
                    userComments: [{
                        user: exampleUsers.alice,
                        text: "aliceText"
                    }, {
                        user: exampleUsers.eve,
                        text: "eveText"
                    }]
                });
            }

            movieRepository.forUser(exampleUsers.bob).deleteCommentFromUserById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger.userComments[0]._id).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return movie comments when deleting a comment of another user', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovieComments(result, {
                    userComments: [{
                        user: exampleUsers.bob,
                        text: "bobText"
                    }, {
                        user: exampleUsers.eve,
                        text: "eveText"
                    }]
                });
            }

            movieRepository.forUser(exampleUsers.bob).deleteCommentFromUserById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger.userComments[1]._id).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return error when deleting the comment with invalid commentId', function (done) {
            movieRepository.forUser(exampleUsers.bob).deleteCommentFromUserById(exampleMovies.theToxicAvenger._id, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

        it('should return error when deleting the comment with invalid movie', function (done) {
            movieRepository.forUser(exampleUsers.bob).deleteCommentFromUserById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), exampleMovies.theToxicAvenger.userComments[1]._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteCommentById()', function () {

        beforeEach(function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger),
                movieRepository.forUser(exampleUsers.alice).create(exampleMovies.theToxicAvengerUpdated),
                movieRepository.forUser(exampleUsers.eve).create(exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                return movieRepository.forUser(exampleUsers.bob).addComment(exampleMovies.theToxicAvenger, "bobText");
            }).then(function () {
                return movieRepository.forUser(exampleUsers.alice).addComment(exampleMovies.theToxicAvenger, "aliceText");
            }).then(function () {
                return movieRepository.forUser(exampleUsers.eve).addComment(exampleMovies.theToxicAvenger, "eveText");
            }).then(function () {
                done();
            });
        });

        it('should return movie comments when deleting own comment', function (done) {

            function evaluateMovie(result) {
                movieEvaluation.evaluateMovieComments(result, {
                    userComments: [{
                        user: exampleUsers.alice,
                        text: "aliceText"
                    }, {
                        user: exampleUsers.eve,
                        text: "eveText"
                    }]
                });
            }

            movieRepository.forUser(exampleUsers.bob).deleteCommentById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger.userComments[0]._id).then(function (result) {
                evaluateMovie(result);
                return movieRepository.forUser(exampleUsers.bob).getById(exampleMovies.theToxicAvenger._id);
            }).then(function (result) {
                evaluateMovie(result);
                done();
            });
        });

        it('should return error when deleting the comment of another user', function (done) {
            movieRepository.forUser(exampleUsers.bob).deleteCommentById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger.userComments[1]._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateAuthenticationError(error, excpectedError);
                done();
            });
        });

        it('should return error when deleting the comment with invalid commentId', function (done) {
            movieRepository.forUser(exampleUsers.bob).deleteCommentById(exampleMovies.theToxicAvenger._id, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

        it('should return error when deleting the comment with invalid movie', function (done) {
            movieRepository.forUser(exampleUsers.bob).deleteCommentById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), exampleMovies.theToxicAvenger.userComments[1]._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('getCommentById()', function () {

        beforeEach(function (done) {
            q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger),
                movieRepository.forUser(exampleUsers.alice).create(exampleMovies.theToxicAvengerUpdated),
                movieRepository.forUser(exampleUsers.eve).create(exampleMovies.returnOfTheKillerTomatos)
            ]).then(function () {
                return movieRepository.forUser(exampleUsers.bob).addComment(exampleMovies.theToxicAvenger, "bobText");
            }).then(function () {
                return movieRepository.forUser(exampleUsers.alice).addComment(exampleMovies.theToxicAvenger, "aliceText");
            }).then(function () {
                return movieRepository.forUser(exampleUsers.eve).addComment(exampleMovies.theToxicAvenger, "eveText");
            }).then(function () {
                done();
            });
        });

        it('should return movie comment when getting a comment', function (done) {
            movieRepository.forUser(exampleUsers.bob).getCommentById(exampleMovies.theToxicAvenger._id, exampleMovies.theToxicAvenger.userComments[0]._id).then(function (result) {
                movieEvaluation.evaluateMovieComment(result, {user: exampleUsers.bob, text: "bobText"});
                done();
            });
        });

        it('should return error when commenting the movie with invalid commentId', function (done) {
            movieRepository.forUser(exampleUsers.bob).getCommentById(exampleMovies.theToxicAvenger._id, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

});