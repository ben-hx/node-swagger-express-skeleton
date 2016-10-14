'use strict';
var chai = require('chai');
var ZSchema = require('z-schema');
var validator = new ZSchema({});
var supertest = require('supertest');
var expect = chai.expect;
var should = chai.should();
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/user");


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
    }

    var alice = {
        username: 'alice',
        password: 'alice'
    }

    var unpostedUser = {
        username: 'haha',
        password: 'haha'
    }

    function postExampleUser(user, done) {
        var result = api.post('/register');
        result.set('Content-Type', 'application/json')
        result.send({
            'username': user.username,
            'password': user.password
        });
        result.end(function (err, res) {
            done(err, res);
        });
    }

    function postExampleUserWithCredentials(credentials, done) {
        var result = api.post('/register');
        result.send(credentials);
        result.end(function (err, res) {
            done(err, res);
        });
    }

    describe('register', function () {

        it('should post a valid user', function (done) {
            postExampleUser(bob, function (err, res) {
                validator.validate(res.body, testConfig.responseOkSchema).should.to.be.true;
                res.status.should.equal(201);
                res.body.success.should.equal(true);
                res.body.data.username.should.equal(bob.username);
                done();
            });
        });

        it("should not post a user with no credentials", function (done) {
            postExampleUserWithCredentials({}, function (err, res) {
                validator.validate(res.body, testConfig.responseErrorSchema).should.to.be.true;
                res.status.should.equal(400);
                res.body.success.should.equal(false);
                done();
            });
        });

        it("should not post a user with no username", function (done) {
            postExampleUserWithCredentials({password: 'bob'}, function (err, res) {
                validator.validate(res.body, testConfig.responseErrorSchema).should.to.be.true;
                res.status.should.equal(400);
                res.body.success.should.equal(false);
                done();
            });
        });

        it("should not post a user with no password",function(done){
            postExampleUserWithCredentials({username: 'bob'}, function(err, res){
                validator.validate(res.body, testConfig.responseErrorSchema).should.to.be.true;
                res.status.should.equal(400);
                res.body.success.should.equal(false);
                done();
            });
        });

        it("should not add two equal users (with the same name)",function(done){
            postExampleUser(bob, function(err, res){
                res.status.should.equal(201);
                res.body.success.should.equal(true);

                postExampleUser(bob, function(err, res){
                    res.status.should.equal(400);
                    res.body.success.should.equal(false);
                    done();
                });

            });
        });


    });


    describe('create', function () {

        it('should respond with 200 successful operation', function (done) {

            /*eslint-disable*/
            var schema = {
                "success": "string",
                "message": "string"
            };

            /*eslint-enable*/
            api.get('/user/login')
                .query({
                    username: 'testusername', password: 'testpassword'
                })
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    expect(validator.validate(res.body, testConfig.responseOkSchema)).to.be.true;
                    done();
                });
        });

    });

});
