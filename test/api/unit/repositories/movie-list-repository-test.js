'use strict';
var chai = require('chai');
var should = chai.should();
var sinon = require("sinon");
var q = require('q');
var mongoose = require("mongoose");

describe('Movie-List-Repository-CRUD-Tests', function () {

    var User = require("../../../../models/user");
    var Movie = require("../../../../models/movie");
    var MovieList = require("../../../../models/movie-list");
    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var exampleMovies = testFactory.exampleData.generateMovies();
    var dbTestUtil = testFactory.dbTestUtil();
    var userTestUtil = testFactory.userTestUtil();
    var movieRepository = testFactory.movieTestUtil().repository;
    var movieListTestUtil = testFactory.movieListTestUtil();
    var movieListRepository = testFactory.movieListTestUtil().repository;
    var movieListEvaluation = testFactory.movieListEvaluation();
    var errorEvaluation = testFactory.errorEvaluation();

    before(dbTestUtil.setUpDb);
    after(dbTestUtil.tearDownDb);

    beforeEach(function (done) {
        movieListTestUtil.initTime();
        exampleUsers = testFactory.exampleData.generateUsers();
        exampleMovies = testFactory.exampleData.generateMovies();
        q.all([
            User.remove(),
            Movie.remove(),
            MovieList.remove(),
            userTestUtil.saveExampleUser(exampleUsers.bob),
            userTestUtil.saveExampleUser(exampleUsers.alice),
            userTestUtil.saveExampleUser(exampleUsers.eve),
        ]).then(function () {
            return q.all([
                movieRepository.forUser(exampleUsers.bob).create(exampleMovies.theToxicAvenger),
                movieRepository.forUser(exampleUsers.alice).create(exampleMovies.theToxicAvengerUpdated),
                movieRepository.forUser(exampleUsers.eve).create(exampleMovies.returnOfTheKillerTomatos)
            ]);
        }).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            User.remove(),
            Movie.remove(),
            MovieList.remove()
        ]).then(function () {
            done();
        });
    });

    describe('create()', function () {

        it('should return a movie-list-item when creating with group access', function (done) {
            var data = {
                title: 'testTitle',
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'group',
                editableUsers: [{user: exampleUsers.eve}],
                tags: ['testTag1']
            };
            movieListRepository.forUser(exampleUsers.bob).create(data).then(function (result) {
                movieListEvaluation.evaluateMovieListItem(result, data);
                done();
            });
        });

        it('should return a movie-list-item when creating with public access', function (done) {
            var data = {
                title: 'testTitle',
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'public',
                editableUsers: [{user: exampleUsers.eve}],
                tags: ['testTag1']
            };
            movieListRepository.forUser(exampleUsers.bob).create(data).then(function (result) {
                movieListEvaluation.evaluateMovieListItem(result, data);
                done();
            });
        });

        it('should return a movie-list-item with private access as default when creating without access', function (done) {
            var data = {
                title: 'testTitle',
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                editableUsers: [{user: exampleUsers.eve}],
                tags: ['testTag1']
            };
            movieListRepository.forUser(exampleUsers.bob).create(data).then(function (result) {
                data.access = 'private';
                movieListEvaluation.evaluateMovieListItem(result, data);
                done();
            });
        });

        it('should return a movie-list-item with empty editableUsers when creating with private access', function (done) {
            var data = {
                title: 'testTitle',
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'private',
                editableUsers: [{user: exampleUsers.eve}],
                tags: ['testTag1']
            };
            movieListRepository.forUser(exampleUsers.bob).create(data).then(function (result) {
                result.editableUsers.should.be.empty;
                movieListEvaluation.evaluateMovieListItem(result, data);
                done();
            });
        });

        it('should return an error when creating invalid movie-list-item', function (done) {
            var data = {
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'private',
                editableUsers: [{user: exampleUsers.eve}],
                tags: ['testTag1']
            };
            movieListRepository.forUser(exampleUsers.bob).create(data).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done()
            });
        });

    });

    describe('getAll()', function () {

        describe('access control', function () {

            describe('private', function () {

                var bobsMovieList;

                beforeEach(function (done) {
                    movieListTestUtil.saveExampleMovieList(2, {
                        movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                        access: 'private',
                        createdUser: exampleUsers.bob
                    }).then(function (result) {
                        bobsMovieList = result;
                        done();
                    });
                });

                it('should return all movie-lists when getting all as createdUser', function (done) {
                    movieListRepository.forUser(exampleUsers.bob).getAll().then(function (result) {
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, bobsMovieList);
                        done();
                    });
                });

                it('should return empty movie-list when getting all as other User', function (done) {
                    movieListRepository.forUser(exampleUsers.alice).getAll().then(function (result) {
                        result.movieLists.should.be.empty;
                        done();
                    });
                });
            });

            describe('public', function () {

                var bobsMovieList;

                beforeEach(function (done) {
                    movieListTestUtil.saveExampleMovieList(2, {
                        movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                        access: 'public',
                        createdUser: exampleUsers.bob
                    }).then(function (result) {
                        bobsMovieList = result;
                        done();
                    });
                });

                it('should return all movie-lists when getting all as createdUser', function (done) {
                    movieListRepository.forUser(exampleUsers.bob).getAll().then(function (result) {
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, bobsMovieList);
                        done();
                    });
                });

                it('should return all movie-lists when getting all as other User', function (done) {
                    movieListRepository.forUser(exampleUsers.alice).getAll().then(function (result) {
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, bobsMovieList);
                        done();
                    });
                });
            });

            describe('group', function () {

                var bobsMovieList;

                beforeEach(function (done) {
                    movieListTestUtil.saveExampleMovieList(2, {
                        movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                        access: 'group',
                        createdUser: exampleUsers.bob,
                        editableUsers: [{user: exampleUsers.eve}]
                    }).then(function (result) {
                        bobsMovieList = result;
                        done();
                    });
                });

                it('should return all movie-lists when getting all as createdUser', function (done) {
                    movieListRepository.forUser(exampleUsers.bob).getAll().then(function (result) {
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, bobsMovieList);
                        done();
                    });
                });

                it('should return all movie-lists when getting all as editable User', function (done) {
                    movieListRepository.forUser(exampleUsers.eve).getAll().then(function (result) {
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, bobsMovieList);
                        done();
                    });
                });

                it('should return empty movie-list when getting all as other User', function (done) {
                    movieListRepository.forUser(exampleUsers.alice).getAll().then(function (result) {
                        result.movieLists.should.be.empty;
                        done();
                    });
                });
            });
        });

        describe('filter', function () {

            var bobsMovieList;

            beforeEach(function (done) {
                movieListTestUtil.saveExampleMovieList(5, {
                    movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                    createdUser: exampleUsers.bob,
                }).then(function (result) {
                    bobsMovieList = result;
                    done();
                });
            });

            describe('by title', function () {

                it('should return movie-lists searched by exactly the title', function (done) {
                    var options = {
                        query: {
                            title: bobsMovieList[0].title
                        }
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        var expected = [
                            bobsMovieList[0]
                        ];
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, expected);
                        done();
                    });
                });

                it('should return movie-lists searched by the part of the title', function (done) {
                    var options = {
                        query: {
                            title: '0'
                        }
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        var expected = [
                            bobsMovieList[0]
                        ];
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, expected);
                        done();
                    });
                });

            });

            describe('by description', function () {

                it('should return movie-lists searched by exactly the description', function (done) {
                    var options = {
                        query: {
                            description: bobsMovieList[0].description
                        }
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        var expected = [
                            bobsMovieList[0]
                        ];
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, expected);
                        done();
                    });
                });

                it('should return movie-lists searched by the part of the description', function (done) {
                    var options = {
                        query: {
                            description: '0'
                        }
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        var expected = [
                            bobsMovieList[0]
                        ];
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, expected);
                        done();
                    });
                });

            });

            describe('by tags', function () {

                it('should return movie-lists searched by tag', function (done) {
                    var options = {
                        query: {
                            tags: bobsMovieList[0].tags[0]
                        }
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        var expected = [
                            bobsMovieList[0]
                        ];
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, expected);
                        done();
                    });
                });

                it('should return movie-lists searched by tags array', function (done) {
                    var options = {
                        query: {
                            tags: bobsMovieList[0].tags
                        }
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, bobsMovieList);
                        done();
                    });
                });

            });

            describe('by created', function () {

                it('should return movie-lists searched by createdFrom until createdTo', function (done) {
                    var options = {
                        query: {
                            createdFrom: bobsMovieList[0].created,
                            createdTo: bobsMovieList[0].created,
                        }
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        var expected = [
                            bobsMovieList[0]
                        ];
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, expected);
                        done();
                    });
                });

                it('should return movie-lists searched by createdFrom', function (done) {
                    var options = {
                        query: {
                            createdFrom: bobsMovieList[0].created
                        }
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, bobsMovieList);
                        done();
                    });
                });

                it('should return movie-lists searched by createdTo', function (done) {
                    var options = {
                        query: {
                            createdTo: bobsMovieList[0].created
                        }
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        var expected = [
                            bobsMovieList[0]
                        ];
                        movieListEvaluation.evaluateMovieListArray(result.movieLists, expected);
                        done();
                    });
                });

            });

            describe('by sort', function () {

                it('should return movie-lists ordered by title', function (done) {
                    var options = {
                        sort: '-title'
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[0], bobsMovieList[4]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[1], bobsMovieList[3]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[2], bobsMovieList[2]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[3], bobsMovieList[1]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[4], bobsMovieList[0]);
                        done();
                    });
                });

                it('should return movie-lists ordered by created', function (done) {
                    var options = {
                        sort: '-created'
                    };
                    movieListRepository.forUser(exampleUsers.bob).getAll(options).then(function (result) {
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[0], bobsMovieList[4]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[1], bobsMovieList[3]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[2], bobsMovieList[2]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[3], bobsMovieList[1]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[4], bobsMovieList[0]);
                        done();
                    });
                });

                it('should return movie-lists ordered by access', function (done) {
                    var options = {
                        sort: '-access'
                    };
                    var alicsMovieList;
                    movieListTestUtil.saveExampleMovieList(2, {
                        title: 'aliceTestTitle',
                        movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                        access: 'public',
                        createdUser: exampleUsers.alice
                    }).then(function (result) {
                        alicsMovieList = result;
                        return movieListRepository.forUser(exampleUsers.bob).getAll(options);
                    }).then(function (result) {
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[0], alicsMovieList[0]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[1], alicsMovieList[1]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[2], bobsMovieList[0]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[3], bobsMovieList[1]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[4], bobsMovieList[2]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[5], bobsMovieList[3]);
                        movieListEvaluation.evaluateMovieListItem(result.movieLists[6], bobsMovieList[4]);
                        done();
                    });
                });

            });

        });

    });

    describe('getById()', function () {

        describe('access control', function () {

            describe('private', function () {

                var bobsMovieList;

                beforeEach(function (done) {
                    movieListTestUtil.saveExampleMovieList(1, {
                        movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                        access: 'private',
                        createdUser: exampleUsers.bob
                    }).then(function (result) {
                        bobsMovieList = result;
                        done();
                    });
                });

                it('should return the movie-list when getting by Id as createdUser', function (done) {
                    movieListRepository.forUser(exampleUsers.bob).getById(bobsMovieList[0]._id).then(function (result) {
                        movieListEvaluation.evaluateMovieListItem(result, bobsMovieList[0]);
                        done();
                    });
                });

                it('should return a not-found-error when getting by Id as other User', function (done) {
                    movieListRepository.forUser(exampleUsers.alice).getById(bobsMovieList[0]._id).catch(function (error) {
                        var excpectedError = {};
                        errorEvaluation.evaluateNotFoundError(error, excpectedError);
                        done();
                    });
                });
            });

            describe('public', function () {

                var bobsMovieList;

                beforeEach(function (done) {
                    movieListTestUtil.saveExampleMovieList(1, {
                        movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                        access: 'public',
                        createdUser: exampleUsers.bob
                    }).then(function (result) {
                        bobsMovieList = result;
                        done();
                    });
                });

                it('should return movie-list when getting by Id as createdUser', function (done) {
                    movieListRepository.forUser(exampleUsers.bob).getById(bobsMovieList[0]._id).then(function (result) {
                        movieListEvaluation.evaluateMovieListItem(result, bobsMovieList[0]);
                        done();
                    });
                });

                it('should return movie-list when getting by Id as other User', function (done) {
                    movieListRepository.forUser(exampleUsers.alice).getById(bobsMovieList[0]._id).then(function (result) {
                        movieListEvaluation.evaluateMovieListItem(result, bobsMovieList[0]);
                        done();
                    });
                });
            });

            describe('group', function () {

                var bobsMovieList;

                beforeEach(function (done) {
                    movieListTestUtil.saveExampleMovieList(2, {
                        movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                        access: 'group',
                        createdUser: exampleUsers.bob,
                        editableUsers: [{user: exampleUsers.eve}]
                    }).then(function (result) {
                        bobsMovieList = result;
                        done();
                    });
                });

                it('should return movie-lists when getting by id as createdUser', function (done) {
                    movieListRepository.forUser(exampleUsers.bob).getById(bobsMovieList[0]._id).then(function (result) {
                        movieListEvaluation.evaluateMovieListItem(result, bobsMovieList[0]);
                        done();
                    });
                });

                it('should return movie-list when getting by Id as editable User', function (done) {
                    movieListRepository.forUser(exampleUsers.eve).getById(bobsMovieList[0]._id).then(function (result) {
                        movieListEvaluation.evaluateMovieListItem(result, bobsMovieList[0]);
                        done();
                    });
                });

                it('should return a not-found-error when getting by Id as other User', function (done) {
                    movieListRepository.forUser(exampleUsers.alice).getById(bobsMovieList[0]._id).catch(function (error) {
                        var excpectedError = {};
                        errorEvaluation.evaluateNotFoundError(error, excpectedError);
                        done();
                    });
                });
            });
        });

        it('should return a not-found-error when getting by invalid id', function (done) {
            movieListRepository.forUser(exampleUsers.bob).getById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('updateById()', function () {

        var bobsMovieList;

        beforeEach(function (done) {
            movieListTestUtil.saveExampleMovieList(2, {
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'group',
                editableUsers: [{user: exampleUsers.eve}],
                createdUser: exampleUsers.bob,
            }).then(function (result) {
                bobsMovieList = result;
                done();
            });
        });

        it('should return a movie-list when updating with data', function (done) {
            var data = {
                title: 'newTitle'
            };
            movieListRepository.forUser(exampleUsers.bob).updateById(bobsMovieList[0]._id, data).then(function (result) {
                bobsMovieList[0] = Object.assign(bobsMovieList[0], data);
                movieListEvaluation.evaluateMovieListItem(result, bobsMovieList[0]);
                done();
            });
        });

        it('should return a movie when updating nothing', function (done) {
            movieListRepository.forUser(exampleUsers.bob).updateById(bobsMovieList[0]._id, {}).then(function (result) {
                movieListEvaluation.evaluateMovieListItem(result, bobsMovieList[0]);
                done();
            });
        });

        it('should return an error when updating with title that already exists', function (done) {
            var data = {
                title: bobsMovieList[1].title
            };
            movieListRepository.forUser(exampleUsers.bob).updateById(bobsMovieList[0]._id, data).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return an error when updating by deleting the current User which is in editableUsers array', function (done) {
            var data = {
                editableUsers: []
            };
            movieListRepository.forUser(exampleUsers.eve).updateById(bobsMovieList[0]._id, data).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a not-found-error when updating by invalid id', function (done) {
            movieListRepository.forUser(exampleUsers.bob).updateById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), {}).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteById()', function () {

        var bobsMovieList;

        beforeEach(function (done) {
            movieListTestUtil.saveExampleMovieList(1, {
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'private',
                createdUser: exampleUsers.bob
            }).then(function (result) {
                bobsMovieList = result;
                done();
            });
        });

        it('should return movie-list when deleting with valid id', function (done) {
            movieListRepository.forUser(exampleUsers.bob).deleteById(bobsMovieList[0]._id).then(function (result) {
                movieListEvaluation.evaluateMovieListItem(result, bobsMovieList[0]);
                done();
            });
        });

        it('should return an error when deleting with invalid id', function (done) {
            movieListRepository.forUser(exampleUsers.bob).deleteById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('addCommentById()', function () {

        var bobsMovieList;

        beforeEach(function (done) {
            movieListTestUtil.saveExampleMovieList(1, {
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'private',
                createdUser: exampleUsers.bob
            }).then(function (result) {
                bobsMovieList = result;
                done();
            });
        });

        it('should return movie comment when adding a comment to the movie', function (done) {

            function evaluate(value) {
                movieListEvaluation.evaluateMovieListItem(value, bobsMovieList[0]);
                movieListEvaluation.evaluateMovieListComments(value, {
                    comments: [{
                        user: exampleUsers.bob,
                        text: "text"
                    }]
                });
            }

            movieListRepository.forUser(exampleUsers.bob).addCommentById(bobsMovieList[0]._id, "text").then(function (result) {
                evaluate(result);
                return movieListRepository.forUser(exampleUsers.bob).getById(bobsMovieList[0]._id);
            }).then(function (result) {
                evaluate(result);
                done();
            });
        });

        it('should return an error when adding comment to invalid movie', function (done) {
            movieListRepository.forUser(exampleUsers.bob).addCommentById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), "asdf").catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteCommentById()', function () {

        var bobsMovieListItem;

        beforeEach(function (done) {
            movieListTestUtil.saveExampleMovieList(1, {
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'public',
                createdUser: exampleUsers.bob
            }).then(function (result) {
                bobsMovieListItem = result[0];
                return movieListRepository.forUser(exampleUsers.bob).addCommentById(bobsMovieListItem._id, "bobText");
            }).then(function () {
                return movieListRepository.forUser(exampleUsers.alice).addCommentById(bobsMovieListItem._id, "aliceText");
            }).then(function () {
                return movieListRepository.forUser(exampleUsers.eve).addCommentById(bobsMovieListItem._id, "eveText");
            }).then(function (result) {
                bobsMovieListItem = result;
                done();
            });
        });

        it('should return movie comment when deleting own comment', function (done) {

            function evaluate(value) {
                movieListEvaluation.evaluateMovieListItem(value, bobsMovieListItem);
                movieListEvaluation.evaluateMovieListComments(value, {
                    comments: [{
                        user: exampleUsers.alice,
                        text: "aliceText"
                    }, {
                        user: exampleUsers.eve,
                        text: "eveText"
                    }]
                });
            }

            movieListRepository.forUser(exampleUsers.bob).deleteCommentById(bobsMovieListItem._id, bobsMovieListItem.comments[0]._id).then(function (result) {
                evaluate(result);
                return movieListRepository.forUser(exampleUsers.bob).getById(bobsMovieListItem._id);
            }).then(function (result) {
                evaluate(result);
                done();
            });
        });

        it('should return error when deleting the comment of another user', function (done) {
            movieListRepository.forUser(exampleUsers.bob).deleteCommentById(bobsMovieListItem._id, bobsMovieListItem.comments[1]._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateAuthenticationError(error, excpectedError);
                done();
            });
        });

        it('should return error when deleting the comment with invalid commentId', function (done) {
            movieListRepository.forUser(exampleUsers.bob).deleteCommentById(bobsMovieListItem._id, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

        it('should return error when deleting the comment with invalid movieList-id', function (done) {
            movieListRepository.forUser(exampleUsers.bob).deleteCommentById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'), bobsMovieListItem.comments[0]._id).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('getCommentById()', function () {

        var bobsMovieListItem;

        beforeEach(function (done) {
            movieListTestUtil.saveExampleMovieList(1, {
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'public',
                createdUser: exampleUsers.bob
            }).then(function (result) {
                bobsMovieListItem = result[0];
                return movieListRepository.forUser(exampleUsers.bob).addCommentById(bobsMovieListItem._id, "bobText");
            }).then(function () {
                return movieListRepository.forUser(exampleUsers.alice).addCommentById(bobsMovieListItem._id, "aliceText");
            }).then(function () {
                return movieListRepository.forUser(exampleUsers.eve).addCommentById(bobsMovieListItem._id, "eveText");
            }).then(function (result) {
                bobsMovieListItem = result;
                done();
            });
        });

        it('should return comment when getting a comment', function (done) {
            movieListRepository.forUser(exampleUsers.bob).getCommentById(bobsMovieListItem._id, bobsMovieListItem.comments[0]._id).then(function (result) {
                movieListEvaluation.evaluateMovieListComment(result, {user: exampleUsers.bob, text: "bobText"});
                done();
            });
        });

        it('should return error when commenting the movie with invalid commentId', function (done) {
            movieListRepository.forUser(exampleUsers.bob).getCommentById(bobsMovieListItem._id, new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

});