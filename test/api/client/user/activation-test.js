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
        User
    ];

    var dropForAll = [
        TempUser
    ];

    before(function (done) {
        var registerUsers = [
            exampleUsers.bob,
            exampleUsers.alice
        ];
        testUtil.dropModels(dropForAll, function () {
            testUtil.registerExampleUsers(registerUsers, function () {
                done();
            });
        });
    });

    beforeEach(function (done) {
        testUtil.dropModels(dropForEach, done);
    });

    afterEach(function (done) {
        testUtil.dropModels(dropForEach, done);
    });

    after(function (done) {
        testUtil.dropModels(dropForAll, done);
    });


    describe('GET /users/inactive', function () {

        describe('logged in', function () {

            describe('role = admin', function () {

                it('should return posted inactive users', function (done) {
                    testUtil.registerExampleUser(exampleUsers.bob, function (err, res) {
                        testUtil.registerExampleUser(exampleUsers.alice, function (err, res) {

                            /*

                             testUtil.getInactiveUsers(exampleUsers.bob, function (err, res) {


                             });
                             */
                            done();
                        });
                    });
                });

            });

        });

    });
});