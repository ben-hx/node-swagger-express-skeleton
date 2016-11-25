'use strict';
var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var testConfig = require('../test-init');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/inaktive-user");
var TempUser = require("../../../../models/inaktive-user");
var testUtil = require(".././test-util");
var exampleUsers = require(".././exampleUsers");

describe('Registration-Endpoint Tests', function () {

    var dropForEach = [
        User, TempUser
    ];

    beforeEach(function (done) {
        testUtil.dropModels(dropForEach, done);
    });

    afterEach(function (done) {
        testUtil.dropModels(dropForEach, done);
    });

    describe('POST /register', function () {

        it('should return a user when registering with valid user-data', function (done) {
            testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                testUtil.evaluateSuccessfulUnregisteredUserResponse(res, 201, exampleUsers.bob);
                done();
            });
        });

        it('should return a user when registering with minimal-user-data', function (done) {
            testUtil.registerExampleUser(exampleUsers.minimal, function (err, res) {
                testUtil.evaluateSuccessfulMinimalUserResponse(res, 201, exampleUsers.minimal);
                done();
            });
        });

        it('should return a bad-request when registering a user with no credentials', function (done) {
            testUtil.registerExampleUserWithCredentials({}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when registering a user with no email', function (done) {
            testUtil.registerExampleUserWithCredentials({password: 'bob'}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when registering a user with no password', function (done) {
            testUtil.registerExampleUserWithCredentials({email: 'bob'}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when registering a user with invalid email', function (done) {
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

        it('should return a bad-request when registering two users with the same username', function (done) {
            testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                testUtil.evaluateSuccessfulUnregisteredUserResponse(res, 201, exampleUsers.bob);
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

        it('should return a bad-request when registering two users with the same email', function (done) {
            testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                testUtil.evaluateSuccessfulUnregisteredUserResponse(res, 201, exampleUsers.bob);
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


});