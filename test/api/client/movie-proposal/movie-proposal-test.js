'use strict';
var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var nock = require('nock');
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);
var User = require("../../../../models/user");
var testUtil = require("../helpers/test-util");


describe('Movie-Proposal-Endpoint Tests', function () {

    before(function (done) {
        User.collection.drop(function () {
            testUtil.registerExampleUser(testUtil.exampleUsers.bob, function () {
                testUtil.registerExampleUser(testUtil.exampleUsers.alice, done);
            });
        });
    });

    after(function (done) {
        User.collection.drop(function () {
            done();
        });

    });

    describe('GET /movies-proposal', function () {

        this.timeout(50000);

        //var scope = nock('http://www.omdbapi.com').get('/?s=The%20Toxic%20Avenger').reply(200, require('../data/toxic-avenger.json'));

        describe('logged in', function () {
            /*
            it('should return posted movies', function (done) {
                testUtil.getMovieProposal(testUtil.exampleUsers.bob, {title: 'The Toxic Avenger'}, function (err, res) {
                    //testUtil.evaluateErrorResponse(res, 401);
                    console.log(res.body);
                    done();
                });
            });
            */

        });

        describe('not logged in', function () {

            it('should return unauthorized when getting movies from unposted user', function (done) {
                testUtil.getMovieProposal(testUtil.exampleUsers.unpostedUser, {}, function (err, res) {
                    testUtil.evaluateErrorResponse(res, 401);
                    done();
                });
            });
        });

    });

});
