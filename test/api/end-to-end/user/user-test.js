'use strict';
var chai = require('chai');

var q = require('q');


describe('User-Endpoint Tests', function () {

    var testConfig = require('./../test-init');
    var User = require("../../../../models/user");
    var InaktiveUser = require("../../../../models/inaktive-user");
    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var apiTestUtil = testFactory.apiTestUtil();
    var apiEvaluation = testFactory.apiEvaluation();
    var errorEvaluation = testFactory.errorEvaluation();
    var userRepositoryTestUtil = testFactory.userTestUtil().repositoryDecorator;
    var api = apiTestUtil.apiDecorator;

    before(apiTestUtil.setUpServer);

    after(apiTestUtil.tearDownServer);

    beforeEach(function (done) {
        exampleUsers = testFactory.exampleData.generateUsers();
        q.all([
            User.remove(),
            InaktiveUser.remove()
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            User.remove(),
            InaktiveUser.remove()
        ]).then(function () {
            done();
        });
    });

    describe('POST /register', function () {

        it('should return 201 with user when registering with valid user-data', function (done) {
            api.register(exampleUsers.bob).then(function (res) {
                apiEvaluation.evaluateSuccessfulRegisterResponse(res, 201, exampleUsers.bob);
                done();
            });
        });

        it('should return 201 with user when registering with minimal-user-data', function (done) {
            api.register(exampleUsers.minimal).then(function (res) {
                apiEvaluation.evaluateSuccessfulMinimalRegisterResponse(res, 201, exampleUsers.minimal)
                done();
            });
        });

        it('should return 400 bad-request when registering with user with no credentials', function (done) {
            api.register({}).then(function (res) {
                apiEvaluation.evaluateErrorResponse(res, 400);
                done();
            });
        });

    });

    describe('POST /users/:inaktive_user_id/activate', function () {

        beforeEach(function (done) {
            q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.adminBob, 'admin'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.moderatorBob, 'moderator'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.looserBob, 'looser')
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with user when activating a user as admin', function (done) {
                api.activate(exampleUsers.adminBob, exampleUsers.bob._id).then(function (res) {
                    apiEvaluation.evaluateSuccessfulRegisterResponse(res, 200, exampleUsers.bob);
                    done();
                });
            });

            it('should return 404 not-found when activating unknown user', function (done) {
                api.activate(exampleUsers.adminBob, 123).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authorized', function () {

            it('should return 401 unauthorized when activating a user as moderator', function (done) {
                api.activate(exampleUsers.moderatorBob, exampleUsers.bob._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

            it('should return 401 unauthorized when activating a user as looser', function (done) {
                api.activate(exampleUsers.looserBob, exampleUsers.bob._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when activating a user', function (done) {
                api.activate(exampleUsers.alice, exampleUsers.bob._id).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('POST /users/:user_id/role/:new_role_name', function () {

        beforeEach(function (done) {
            q.all([
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.bob, 'looser'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.adminBob, 'admin'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.moderatorBob, 'moderator'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.looserBob, 'looser')
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with user when setting a role as admin', function (done) {
                api.setRole(exampleUsers.adminBob, exampleUsers.bob._id, 'moderator').then(function (res) {
                    apiEvaluation.evaluateUserResponse(res, 200, exampleUsers.bob);
                    done();
                });
            });

            it('should return 400 validation-error when setting to unknown-role', function (done) {
                api.setRole(exampleUsers.adminBob, exampleUsers.bob._id, 'unknown').then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 400);
                    done();
                });
            });

            it('should return 404 not-found when setting role to unknown user', function (done) {
                api.setRole(exampleUsers.adminBob, 123, 'moderator').then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 404);
                    done();
                });
            });

        });

        describe('not authroized', function () {

            it('should return 401 unauthorized when setting role as moderator', function (done) {
                api.setRole(exampleUsers.moderatorBob, exampleUsers.bob._id, 'moderator').then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

            it('should return 401 unauthorized when setting role as looser', function (done) {
                api.setRole(exampleUsers.looserBob, exampleUsers.bob._id, 'moderator').then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when activating a user', function (done) {
                api.setRole(exampleUsers.alice, exampleUsers.bob._id, 'moderator').then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('GET /users', function () {

        beforeEach(function (done) {
            q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.alice),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.bob, 'looser'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.adminBob, 'admin'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.moderatorBob, 'moderator'),
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.looserBob, 'looser')
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with users when getting all users as admin', function (done) {
                api.getUsers(exampleUsers.adminBob).then(function (res) {
                    var expected = [
                        exampleUsers.bob,
                        exampleUsers.adminBob,
                        exampleUsers.moderatorBob,
                        exampleUsers.looserBob,
                    ];
                    apiEvaluation.evaluateUsersResponse(res, 200, expected);
                    done();
                });
            });

            it('should return 200 with users when getting with query', function (done) {
                api.getUsers(exampleUsers.adminBob, {username: 'bob'}).then(function (res) {
                    var expected = [
                        exampleUsers.bob,
                    ];
                    apiEvaluation.evaluateUsersResponse(res, 200, expected);
                    done();
                });
            });

        });

        describe('not authorized', function () {

            it('should return 401 unauthorized when getting all users as moderator', function (done) {
                api.getUsers(exampleUsers.moderatorBob).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

            it('should return 401 unauthorized when getting all users as looser', function (done) {
                api.getUsers(exampleUsers.looserBob).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when getting all users', function (done) {
                api.getUsers(exampleUsers.alice).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

    describe('GET /inaktive_users', function () {

        beforeEach(function (done) {
            q.all([
                userRepositoryTestUtil.getActivatedUserWithRole(exampleUsers.adminBob, 'admin'),
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.registerExampleUser(exampleUsers.alice),
            ]).then(function () {
                done();
            });
        });

        describe('authenticated', function () {

            it('should return 200 with users when getting all inaktive-users as admin', function (done) {
                api.getInaktiveUsers(exampleUsers.adminBob, {sort: 'username'}).then(function (res) {
                    var expected = [
                        exampleUsers.bob,
                        exampleUsers.alice
                    ];
                    apiEvaluation.evaluateInaktiveUsersResponse(res, 200, expected);
                    done();
                });
            });

            it('should return 200 with inaktive-users when getting with query', function (done) {
                api.getInaktiveUsers(exampleUsers.adminBob, {username: 'bob'}).then(function (res) {
                    var expected = [
                        exampleUsers.bob,
                    ];
                    apiEvaluation.evaluateInaktiveUsersResponse(res, 200, expected);
                    done();
                });
            });
        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when getting all inaktive-users as moderator', function (done) {
                api.getInaktiveUsers(exampleUsers.moderatorBob).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

            it('should return 401 unauthorized when getting all inaktive-users as looser', function (done) {
                api.getInaktiveUsers(exampleUsers.looserBob).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

        describe('not authenticated', function () {

            it('should return 401 unauthorized when when getting all inaktive-users', function (done) {
                api.getInaktiveUsers(exampleUsers.alice).then(function (res) {
                    apiEvaluation.evaluateErrorResponse(res, 401);
                    done();
                });
            });

        });

    });

});