'use strict';
var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/user");
var testUtil = require("../helpers/test-util");
var exampleUsers = require("../helpers/exampleUsers");

describe('User-Endpoint Tests', function () {

    beforeEach(function (done) {
        User.collection.drop(function () {
            done();
        });
    });

    afterEach(function (done) {
        User.collection.drop(function () {
            done();
        });
    });

    function changePassword(user, oldPassword, newPassword, done) {
        var result = api.post("/changepassword");
        result.set('Content-Type', 'application/json');
        result.send({
            'old_password': oldPassword,
            'new_password': newPassword
        });
        result.auth(user.username, user.password);
        result.end(function (err, res) {
            done(err, res);
        });
    }

    function getMe(user, done) {
        var result = api.get("/me");
        result.auth(user.username, user.password);
        result.end(function (err, res) {
            done(err, res);
        });
    }

    describe('POST /register', function () {

        it('should return a user when posting valid user-data', function (done) {
            testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                testUtil.evaluateSuccessfulUserResponse(res, 201, exampleUsers.bob);
                done();
            });
        });

        it('should return a user when posting minimal-user-data', function (done) {
            testUtil.registerExampleUser(exampleUsers.minimal, function (err, res) {
                testUtil.evaluateSuccessfulMinimalUserResponse(res, 201, exampleUsers.minimal);
                done();
            });
        });

        it('should return a bad-request when posting a user with no credentials', function (done) {
            testUtil.registerExampleUserWithCredentials({}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when posting a user with no email', function (done) {
            testUtil.registerExampleUserWithCredentials({password: 'bob'}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when posting a user with no password', function (done) {
            testUtil.registerExampleUserWithCredentials({email: 'bob'}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when posting a user with invalid email', function (done) {
            var user = {
                username: 'invalid',
                email: 'invalid',
                password: 'invalid'
            };
            testUtil.registerExampleUser(user, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });


        it('should return a bad-request when posting two users with the same username', function (done) {
            testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                testUtil.evaluateSuccessfulUserResponse(res, 201, exampleUsers.bob);
                var user = {
                    username: exampleUsers.bob.username,
                    email: 'invalid@invalid.de',
                    password: 'invalid'
                };
                testUtil.registerExampleUser(user, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 400);
                    done();
                });
            });
        });

        it('should return a bad-request when posting two users with the same email', function (done) {
            testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                testUtil.evaluateSuccessfulUserResponse(res, 201, exampleUsers.bob);
                var user = {
                    username: 'invalid',
                    email: exampleUsers.bob.email,
                    password: 'invalid'
                };
                testUtil.registerExampleUser(user, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 400);
                    done();
                });
            });
        });

    });

    describe('POST /changepassword', function () {

        describe('logged in', function () {

            it('should return a user when changing a valid password', function (done) {
                testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                    changePassword(exampleUsers.bob, exampleUsers.bob.password, "1234", function (err, res) {
                        testUtil.evaluateSuccessfulUserResponse(res, 200, exampleUsers.bob);
                        done();
                    });
                });
            });

            it('should return a user when changing the password to the same as before', function (done) {
                testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                    changePassword(exampleUsers.bob, exampleUsers.bob.password, exampleUsers.bob.password, function (err, res) {
                        testUtil.evaluateSuccessfulUserResponse(res, 200, exampleUsers.bob);
                        done();
                    });
                });
            });

            it('should return a bad-request when wrong old password is set', function (done) {
                testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                    changePassword(exampleUsers.bob, exampleUsers.bob.password + 44, "1234", function (err, res) {
                        testUtil.evaluateErrorResponse(res, 400);
                        done();
                    });
                });
            });

        });

        describe('not logged in', function () {

            it('should return unauthorized when posting an unposted user', function (done) {
                testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                    changePassword(exampleUsers.unpostedUser, exampleUsers.unpostedUser.password, "1234", function (err, res) {
                        testUtil.evaluateErrorResponse(res, 401);
                        done();
                    });
                });
            });

        });

    });

    describe('GET /me', function () {

        describe('logged in', function () {

            it('should return the logged in user when getting me', function (done) {
                testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                    getMe(exampleUsers.bob, function (err, res) {
                        testUtil.evaluateSuccessfulUserResponse(res, 200, exampleUsers.bob);
                        done();
                    });
                });
            });

            it('should return unauthorized when getting me with the wrong password', function (done) {
                testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                    exampleUsers.bob.password = 'wrong'
                    getMe(exampleUsers.bob, function (err, res) {
                        testUtil.evaluateErrorResponse(res, 401);
                        done();
                    });
                });
            });

        });

        describe('not logged in', function () {

            it('should return unauthorized when getting an unposted user', function (done) {
                testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                    getMe(exampleUsers.unpostedUser, function (err, res) {
                        testUtil.evaluateErrorResponse(res, 401);
                        done();
                    });
                });
            });

        });

    });

});
