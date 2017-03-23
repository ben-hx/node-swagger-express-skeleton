'use strict';
var chai = require('chai');
var q = require('q');

describe('Movie-List-Endpoint Tests', function () {

    var testConfig = require('../test-init');
    var User = require("../../../../models/user");
    var InaktiveUser = require("../../../../models/inaktive-user");
    var Movie = require("../../../../models/movie");
    var MovieList = require("../../../../models/movie-list");
    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var exampleMovies = testFactory.exampleData.generateMovies();
    var apiTestUtil = testFactory.apiTestUtil();
    var apiEvaluation = testFactory.apiEvaluation();
    var errorEvaluation = testFactory.errorEvaluation();
    var userRepositoryTestUtil = testFactory.userTestUtil().repositoryDecorator;
    var movieTestUtil = testFactory.movieTestUtil();
    var api = apiTestUtil.apiDecorator;

    before(function (done) {
        exampleUsers = testFactory.exampleData.generateUsers();
        apiTestUtil.setUpServer().then(function () {
            return q.all([
                User.remove(),
                InaktiveUser.remove(),
                Movie.remove()
            ]);
        }).then(function () {
            return q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.adminBob, 'admin'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.moderatorBob, 'moderator'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.looserBob, 'looser')
            ]);
        }).then(function () {
            return q.all([
                movieTestUtil.saveExampleMovieFromUser(exampleMovies.theToxicAvenger, exampleUsers.bob),
                movieTestUtil.saveExampleMovieFromUser(exampleMovies.returnOfTheKillerTomatos, exampleUsers.bob)
            ]);
        }).then(function () {
            done();
        });

    });

    after(function (done) {
        q.all([
            User.remove(),
            InaktiveUser.remove(),
            Movie.remove()
        ]).then(function () {
            return q.all([
                apiTestUtil.tearDownServer()
            ]);
        }).then(function () {
            done();
        });
    });

    beforeEach(function (done) {
        q.all([
            MovieList.remove()
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            MovieList.remove()
        ]).then(function () {
            done();
        });
    });

    describe('POST /movie-lists', function () {

        describe('authenticated', function () {

            var data;

            beforeEach(function (done) {
                data = {
                    title: 'testTitle',
                    description: 'testDescription',
                    movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                    access: 'public',
                    editableUsers: [{user: exampleUsers.moderatorBob}],
                    tags: ['testTag1']
                };
                done();
            });

            it('should return 201 with movieList when creating movieList with valid data as admin', function (done) {
                api.postMovieList(exampleUsers.adminBob, data).then(function (res) {
                    apiEvaluation.evaluateMovieListResponse(res, 201, data, exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 201 with movie when creating movieList with valid data as moderator', function (done) {
                api.postMovieList(exampleUsers.moderatorBob, data).then(function (res) {
                    apiEvaluation.evaluateMovieListResponse(res, 201, data, exampleUsers.moderatorBob);
                    done();
                });
            });

            it('should return 400 validation-error when creating two movieLists with the same title', function (done) {
                api.postMovieList(exampleUsers.adminBob, data).then(function (res) {
                    return api.postMovieList(exampleUsers.adminBob, data);
                }).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

            it('should return 400 validation-error when creating movieList with invalid data', function (done) {
                api.postMovieList(exampleUsers.adminBob, {}).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

        });

        describe('not authorized', function () {

            it('should return 401 unauthorized when creating a movieList', function (done) {
                api.postMovieList(exampleUsers.bob, {}).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when creating a movieList', function (done) {
                api.postMovie(exampleUsers.alice, {}).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });


    describe('GET /movie_lists', function () {

        var adminBobsMovieList = [
            {
                title: 'testTitle1',
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'public',
                tags: ['testTag1']
            },
            {
                title: 'testTitle2',
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'public',
                tags: ['testTag1']
            }
        ];

        beforeEach(function (done) {
            q.all([
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[0]),
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[1])
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movieLists when getting all as admin', function (done) {
                api.getMovieLists(exampleUsers.adminBob, {}).then(function (res) {
                    var expected = adminBobsMovieList;
                    apiEvaluation.evaluateMovieListsResponse(res, 200, expected);
                    done();
                });
            });

            it('should return 200 with movieLists when getting with query', function (done) {
                api.getMovieLists(exampleUsers.adminBob, {title: adminBobsMovieList[0].title}).then(function (res) {
                    var expected = [
                        adminBobsMovieList[0]
                    ];
                    apiEvaluation.evaluateMovieListsResponse(res, 200, expected);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when getting all movieLists', function (done) {
                api.getMovieLists(exampleUsers.alice, {}).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });


    describe('GET /movie_lists/:movie_list_id', function () {

        var adminBobsMovieList = [
            {
                title: 'testTitle1',
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'public',
                tags: ['testTag1']
            },
            {
                title: 'testTitle2',
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'public',
                tags: ['testTag1']
            }
        ];

        beforeEach(function (done) {
            q.all([
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[0]),
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[1])
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movie when getting the movieList as admin', function (done) {
                api.getMovieList(exampleUsers.adminBob, adminBobsMovieList[0]._id).then(function (res) {
                    apiEvaluation.evaluateMovieListResponse(res, 200, adminBobsMovieList[0], exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 404 not-found-error when getting the movieList with invalid id', function (done) {
                api.getMovieList(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when getting getting the movieList', function (done) {
                api.getMovieList(exampleUsers.alice, adminBobsMovieList[0]._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });


    describe('PUT /movie/:movie_id', function () {

        var adminBobsMovieList;

        beforeEach(function (done) {
            adminBobsMovieList = [
                {
                    title: 'testTitle1',
                    description: 'testDescription',
                    movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                    access: 'public',
                    tags: ['testTag1']
                },
                {
                    title: 'testTitle2',
                    description: 'testDescription',
                    movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                    access: 'public',
                    editableUsers: [{user: exampleUsers.moderatorBob}],
                    tags: ['testTag1']
                }
            ];
            q.all([
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[0]),
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[1])
            ]).then(function (result) {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movieList when updating with valid data as admin', function (done) {
                var updatedData = adminBobsMovieList[0];
                updatedData.description = 'updatedDescription';
                api.putMovieList(exampleUsers.adminBob, updatedData._id, updatedData).then(function (res) {
                    apiEvaluation.evaluateMovieListResponse(res, 200, updatedData, exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 200 with movie when updating with valid data as editableUser', function (done) {
                var updatedData = adminBobsMovieList[1];
                updatedData.description = 'updatedDescription';
                api.putMovieList(exampleUsers.moderatorBob, updatedData._id, updatedData).then(function (res) {
                    apiEvaluation.evaluateMovieListResponse(res, 200, updatedData, exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 401 unauthorized when updating as non creator or editableUser', function (done) {
                var updatedData = adminBobsMovieList[0];
                updatedData.description = 'updatedDescription';
                api.putMovieList(exampleUsers.moderatorBob, updatedData._id, updatedData).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

            it('should return 400 validation-error when updating to invalid title', function (done) {
                var updatedData = adminBobsMovieList[0];
                updatedData.title = adminBobsMovieList[1].title;
                api.putMovieList(exampleUsers.adminBob, updatedData._id, updatedData).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

            it('should return 404 not-found-error when updating with invalid id', function (done) {
                api.putMovieList(exampleUsers.moderatorBob, "123", {}).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });
        });

        describe('not authorized', function () {

            it('should return 401 unauthorized when updating', function (done) {
                api.putMovieList(exampleUsers.bob, "123", {}).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when updating', function (done) {
                api.putMovieList(exampleUsers.alice, "123", {}).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });


    describe('DELETE /movie_list/:movie_list_id', function () {

        var adminBobsMovieList;

        beforeEach(function (done) {
            adminBobsMovieList = [
                {
                    title: 'testTitle1',
                    description: 'testDescription',
                    movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                    access: 'public',
                    tags: ['testTag1']
                },
                {
                    title: 'testTitle2',
                    description: 'testDescription',
                    movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                    access: 'public',
                    editableUsers: [{user: exampleUsers.moderatorBob}],
                    tags: ['testTag1']
                }
            ];
            q.all([
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[0]),
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[1])
            ]).then(function (result) {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with movieList when deleting as admin', function (done) {
                api.deleteMovieList(exampleUsers.adminBob, adminBobsMovieList[0]._id).then(function (res) {
                    apiEvaluation.evaluateMovieListResponse(res, 200, adminBobsMovieList[0], exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 200 with movie when deleting movie as editableUser', function (done) {
                api.deleteMovieList(exampleUsers.moderatorBob, adminBobsMovieList[1]._id).then(function (res) {
                    apiEvaluation.evaluateMovieListResponse(res, 200, adminBobsMovieList[1], exampleUsers.adminBob);
                    done();
                });
            });

            it('should return 401 unauthorized when deleting as non creator or editableUser', function (done) {
                api.deleteMovieList(exampleUsers.moderatorBob, adminBobsMovieList[0]._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

            it('should return 404 not-found-error when deleting movie with invalid movie_id', function (done) {
                api.deleteMovieList(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authorized', function () {

            it('should return 401 unauthorized when deleting a movie as looser', function (done) {
                api.deleteMovieList(exampleUsers.looserBob, adminBobsMovieList[0]._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when updating a movie', function (done) {
                api.deleteMovieList(exampleUsers.alice, adminBobsMovieList[0]._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });


    describe('POST /movie_list/:movie_list_id/comments', function () {

        var adminBobsMovieList;

        beforeEach(function (done) {
            adminBobsMovieList = [
                {
                    title: 'testTitle1',
                    description: 'testDescription',
                    movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                    access: 'public',
                    tags: ['testTag1']
                },
                {
                    title: 'testTitle2',
                    description: 'testDescription',
                    movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                    access: 'public',
                    editableUsers: [{user: exampleUsers.moderatorBob}],
                    tags: ['testTag1']
                }
            ];
            q.all([
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[0]),
                api.postMovieList(exampleUsers.adminBob, adminBobsMovieList[1])
            ]).then(function (result) {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with comment when commenting', function (done) {
                api.postMovieListComment(exampleUsers.adminBob, adminBobsMovieList[0]._id, "bobComment").then(function (res) {
                    apiEvaluation.evaluateMovieListComments(res, 200,
                        [{user: exampleUsers.adminBob, text: "bobComment"}]
                    );
                    done();
                });
            });

            it('should return 404 not-found-error when commenting invalid movieList', function (done) {
                api.postMovieListComment(exampleUsers.adminBob, 123, "bobComment").then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when setting movie rating', function (done) {
                api.postMovieListComment(exampleUsers.alice, 123, "aliceComment").then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });


    describe('DELETE /movie/:movie_id/comments/comment_id', function () {

        var adminBobsMovieList;

        beforeEach(function (done) {
            adminBobsMovieList = {
                title: 'testTitle2',
                description: 'testDescription',
                movies: [{movie: exampleMovies.theToxicAvenger}, {movie: exampleMovies.returnOfTheKillerTomatos}],
                access: 'public',
                editableUsers: [{user: exampleUsers.moderatorBob}],
                tags: ['testTag1']
            };
            api.postMovieList(exampleUsers.adminBob, adminBobsMovieList).then(function (result) {
                return api.postMovieListComment(exampleUsers.adminBob, adminBobsMovieList._id, "adminBobText1");
            }).then(function () {
                return api.postMovieListComment(exampleUsers.moderatorBob, adminBobsMovieList._id, "moderatorBob1");
            }).then(function (result) {
                adminBobsMovieList = result.body.data.movieList;
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with comment when deleting a comment as admin', function (done) {
                api.deleteMovieListComment(exampleUsers.adminBob, adminBobsMovieList._id, adminBobsMovieList.comments[0]._id).then(function (res) {
                    apiEvaluation.evaluateMovieListComments(res, 200,
                        [{user: exampleUsers.moderatorBob, text: "moderatorBob1"}]
                    );
                    done();
                });
            });

            it('should return 401 unauthorized with comments when deleting the comment of another user as moderator', function (done) {
                api.deleteMovieListComment(exampleUsers.moderatorBob, adminBobsMovieList._id, adminBobsMovieList.comments[0]._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

            it('should return 404 not-found-error when deleting invalid comment', function (done) {
                api.deleteMovieListComment(exampleUsers.adminBob, adminBobsMovieList._id, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

            it('should return 404 not-found-error when deleting comment of invalid movieList', function (done) {
                api.deleteMovieListComment(exampleUsers.adminBob, 404, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });
        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when setting movie watched', function (done) {
                api.deleteMovieListComment(exampleUsers.alice, adminBobsMovieList._id, adminBobsMovieList.comments[0]._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

});