'use strict';
var chai = require('chai');
var should = chai.should();
var excpect = chai.expect();

describe('Authorization-Service-Tests', function () {

    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var dbTestUtil = testFactory.dbTestUtil();
    var errorEvaluation = testFactory.errorEvaluation();
    var authTestUtil = testFactory.authTestUtil();

    var errors = require("../../../../errors/errors");

    var testUser = {
        _id: 'someId',
        username: 'testusername',
        email: 'test@test.de',
        password: 'testpassword',
        role: 'testRole'
    };

    describe('forUser()', function () {

        it('should throw Exception when no User is set', function (done) {
            errorEvaluation.evaluateExecption(function () {
                authTestUtil.authorizationService.forUser();
            }, errors.IllegalArgumentError);
            done();
        });

        describe('getCurrentUser()', function () {

            it('should return currentUser', function (done) {
                var authenticationService = authTestUtil.authorizationService.forUser(testUser);
                authenticationService.getCurrentUser().should.be.equal(testUser);
                done();
            });

        });

        describe('checkPermission()', function () {

            var authenticationService = authTestUtil.authorizationService.forUser(testUser);

            it('should return true when currentUser has permission "testRole"', function (done) {
                authenticationService.checkPermission(['testRole']).should.be.true;
                authenticationService.checkPermission(['testRole', 'otherTestRole']).should.be.true;
                done();
            });

            it('should return true when checkPermission to no Role or empty Array', function (done) {
                authenticationService.checkPermission().should.be.true;
                authenticationService.checkPermission([]).should.be.true;
                done();
            });

            it('should throw Exception when currentUser has wrong permission', function (done) {
                errorEvaluation.evaluateExecption(function () {
                    authenticationService.checkPermission(['wrongRole']);
                }, errors.AuthenticationError);

                errorEvaluation.evaluateExecption(function () {
                    authenticationService.checkPermission(['wrongRole', 'wrongRole']);
                }, errors.AuthenticationError);

                done();
            });

        });

    });

});