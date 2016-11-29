'use strict';
var chai = require('chai');
var should = chai.should();
var sinon = require("sinon");
chai.use(require("sinon-chai"));

describe('User-Authorization-Repository-Tests', function () {

    var testFactory = require("../../../helpers/test-factory")();
    var errors = require("../../../../../errors/errors");
    var errorEvaluation = testFactory.errorEvaluation();
    var authTestUtil = testFactory.authTestUtil();
    var UserAuthorizationRepository = require("../../../../../repositories/authorization-decorators/user-repository");
    var UserRepository = require("../../../../../repositories/user-repository");

    function checkMethodForRole(role, methodName, args) {
        var userRepositoryStub = sinon.stub(new UserRepository());
        var authorizationRepository = new UserAuthorizationRepository(userRepositoryStub, authTestUtil.authorizationServiceForUserWitRole(role));
        var args = Array.prototype.slice.call(arguments, 2);
        authorizationRepository[methodName].apply(this, args);
        userRepositoryStub[methodName].should.have.been.calledOnce;
    }


    describe('register()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodForRole(role, 'register');
            });
            done();
        });

    });

    describe('activateById()', function () {

        var user = sinon.spy();

        it('should be callable for admin', function (done) {
            checkMethodForRole('admin', 'activateById', user);
            done();
        });

        it('should not be callable for other roles but admin ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodForRole(role, 'activateById', user);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('setRoleById()', function () {

        var user = sinon.spy();

        it('should be callable for admin', function (done) {
            checkMethodForRole('admin', 'setRoleById', user, 'moderator');
            done();
        });

        it('should not be callable for other roles but admin ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodForRole(role, 'setRoleById', user, 'moderator');
                }, errors.AuthenticationError);
            });
            done();
        });
    });

    describe('getInaktiveUsers()', function () {

        var options = sinon.spy();

        it('should be callable for admin', function (done) {
            checkMethodForRole('admin', 'getInaktiveUsers', options);
            done();
        });

        it('should not be callable for other roles but admin ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodForRole(role, 'getInaktiveUsers', options);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('getUsers()', function () {
        var options = sinon.spy();

        it('should be callable for admin', function (done) {
            checkMethodForRole('admin', 'getUsers', options);
            done();
        });

        it('should not be callable for other roles but admin ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodForRole(role, 'getUsers', options);
                }, errors.AuthenticationError);
            });
            done();
        });
    });

});