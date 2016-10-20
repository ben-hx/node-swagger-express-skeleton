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

    var bob = {
        username: 'bob',
        password: 'bob'
    };

    var alice = {
        username: 'alice',
        password: 'alice'
    };

    var unpostedUser = {
        username: 'haha',
        password: 'haha'
    };

    function registerExampleUser(user, done) {
        var result = api.post('/register');
        result.set('Content-Type', 'application/json');
        result.send({
            'username': user.username,
            'password': user.password
        });
        result.end(function (err, res) {
            done(err, res);
        });
    }

    function registerExampleUserWithCredentials(credentials, done) {
        var result = api.post('/register');
        result.send(credentials);
        result.end(function (err, res) {
            done(err, res);
        });
    }

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
            registerExampleUser(bob, function (err, res) {
                testUtil.evaluateSuccessfulUserResponse(res, 201, bob);
                done();
            });
        });

        it('should return a bad-request when posting a user with no credentials', function (done) {
            registerExampleUserWithCredentials({}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when posting a user with no username', function (done) {
            registerExampleUserWithCredentials({password: 'bob'}, function (err, res) {
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when posting a user with no password',function(done){
            registerExampleUserWithCredentials({username: 'bob'}, function(err, res){
                testUtil.evaluateErrorResponse(res, 400);
                done();
            });
        });

        it('should return a bad-request when posting two users with the same username',function(done){
            registerExampleUser(bob, function(err, res){
                testUtil.evaluateSuccessfulUserResponse(res, 201, bob);

                registerExampleUser(bob, function(err, res){
                    testUtil.evaluateErrorResponse(res, 400);
                    done();
                });

            });
        });

    });


    describe('POST /changepassword', function() {

        describe('logged in', function() {

            it('should return a user when changing a valid passwor',function(done){
                registerExampleUser(bob, function(err, res){
                    changePassword(bob, bob.password, "1234", function(err, res) {
                        testUtil.evaluateSuccessfulUserResponse(res, 200, bob);
                        done();
                    });
                });
            });

            it('should return a bad-request when wrong old password is set',function(done){
                registerExampleUser(bob, function(err, res){
                    changePassword(bob, bob.password+44, "1234", function(err, res) {
                        testUtil.evaluateErrorResponse(res, 400);
                        done();
                    });
                });
            });

        });

        describe('not logged in', function() {

            it('should return unauthorized when posting an unposted user',function(done){
                registerExampleUser(bob, function(err, res){
                    changePassword(unpostedUser, unpostedUser.password, "1234", function(err, res) {
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
                registerExampleUser(bob, function(err, res){
                    getMe(bob, function(err, res) {
                        testUtil.evaluateSuccessfulUserResponse(res, 200, bob);
                        done();
                    });
                });
            });

        });

        describe('not logged in', function() {

            it('should return unauthorized when getting an unposted user',function(done){
                registerExampleUser(bob, function(err, res){
                    getMe(unpostedUser, function(err, res) {
                        testUtil.evaluateErrorResponse(res, 401);
                        done();
                    });
                });
            });

        });

    });

});
