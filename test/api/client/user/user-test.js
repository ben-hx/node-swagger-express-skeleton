'use strict';
var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/user");
var testUtil = require("../helpers/test-util");


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
        result.end(function(err, res){
            done(err, res);
        });
    }

    function getMe(user, done) {
        var result = api.get("/me");
        result.auth(user.username, user.password);
        result.end(function(err, res){
            done(err, res);
        });
    }

    describe('POST /register', function () {

        it('should return a user when posting valid user-data', function (done) {
            testUtil.registerExampleUser(testUtil.exampleUsers.bob, function (err, res) {
                testUtil.evaluateSuccessfulUserResponse(res, 201, testUtil.exampleUsers.bob);
                done();
            });
        });

        it('should return a bad-request when posting a user with no credentials', function (done) {
            testUtil.registerExampleUserWithCredentials({}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when posting a user with no username', function (done) {
            testUtil.registerExampleUserWithCredentials({password: 'bob'}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when posting a user with no password',function(done){
            testUtil.registerExampleUserWithCredentials({username: 'bob'}, function(err, res){
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when posting two users with the same username',function(done){
            testUtil.registerExampleUser(testUtil.exampleUsers.bob, function(err, res){
                testUtil.evaluateSuccessfulUserResponse(res, 201, testUtil.exampleUsers.bob);

                testUtil.registerExampleUser(testUtil.exampleUsers.bob, function(err, res){
                    testUtil.evaluateErrorResponse(res, 400);
                    done();
                });

            });
        });

    });


    describe('POST /changepassword', function() {

        describe('logged in', function() {

            it('should return a user when changing a valid passwor',function(done){
                testUtil.registerExampleUser(testUtil.exampleUsers.bob, function(err, res){
                    changePassword(testUtil.exampleUsers.bob, testUtil.exampleUsers.bob.password, "1234", function(err, res) {
                        testUtil.evaluateSuccessfulUserResponse(res, 200, testUtil.exampleUsers.bob);
                        done();
                    });
                });
            });

            it('should return a bad-request when wrong old password is set',function(done){
                testUtil.registerExampleUser(testUtil.exampleUsers.bob, function(err, res){
                    changePassword(testUtil.exampleUsers.bob, testUtil.exampleUsers.bob.password+44, "1234", function(err, res) {
                        testUtil.evaluateErrorResponse(res, 400);
                        done();
                    });
                });
            });

        });

        describe('not logged in', function() {

            it('should return unauthorized when posting an unposted user',function(done){
                testUtil.registerExampleUser(testUtil.exampleUsers.bob, function(err, res){
                    changePassword(testUtil.exampleUsers.unpostedUser, testUtil.exampleUsers.unpostedUser.password, "1234", function(err, res) {
                        testUtil.evaluateErrorResponse(res, 401);
                        done();
                    });
                });
            });

        });

    });

    describe('GET /me', function() {

        describe('logged in', function() {

            it('should return the logged in user when getting me',function(done){
                testUtil.registerExampleUser(testUtil.exampleUsers.bob, function(err, res){
                    getMe(testUtil.exampleUsers.bob, function(err, res) {
                        testUtil.evaluateSuccessfulUserResponse(res, 200, testUtil.exampleUsers.bob);
                        done();
                    });
                });
            });

        });

        describe('not logged in', function() {

            it('should return unauthorized when getting an unposted user',function(done){
                testUtil.registerExampleUser(testUtil.exampleUsers.bob, function(err, res){
                    getMe(testUtil.exampleUsers.unpostedUser, function(err, res) {
                        testUtil.evaluateErrorResponse(res, 401);
                        done();
                    });
                });
            });

        });

    });

});
