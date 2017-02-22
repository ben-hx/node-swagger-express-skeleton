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
        var errorsStub = sinon.stub();
        var authorizationRepository = new UserAuthorizationRepository(errorsStub, userRepositoryStub, authTestUtil.authorizationServiceForUserWitRole(role));
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

    describe('create()', function () {

        var user = sinon.spy();

        it('should be callable for admin', function (done) {
            checkMethodForRole('admin', 'create', user);
            done();
        });

        it('should not be callable for other roles but admin ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodForRole(role, 'create', user);
                }, errors.AuthenticationError);
            });
            done();
        });
    });

    describe('updateById()', function () {

        var id = sinon.spy();
        var user = sinon.spy();

        it('should be callable for admin', function (done) {
            checkMethodForRole('admin', 'updateById', id, user);
            done();
        });

        it('should not be callable for other roles but admin ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodForRole(role, 'updateById', id, user);
                }, errors.AuthenticationError);
            });
            done();
        });


        var id = sinon.spy();
        var user = sinon.spy();

        it('should be callable for all roles if id equals the current User id', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                var userRepositoryStub = sinon.stub(new UserRepository());
                var authService = authTestUtil.authorizationServiceForUserWitRole("moderator");
                var authorizationRepository = new UserAuthorizationRepository(errors, userRepositoryStub, authService);
                authorizationRepository.updateById(authService.getCurrentUser()._id, user);
            });
            done();
        });
        
        it('should throw an error when updating another user if not admin', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                var userRepositoryStub = sinon.stub(new UserRepository());
                var authService = authTestUtil.authorizationServiceForUserWitRole(role);
                var authorizationRepository = new UserAuthorizationRepository(errors, userRepositoryStub, authService);

                errorEvaluation.evaluateExecption(function () {
                    authorizationRepository.updateById(authService.getCurrentUser()._id + 1, user);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('getUserById()', function () {

        var id = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodForRole(role, 'getUserById', id);
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

    describe('deleteUserById()', function () {

        var id = sinon.spy();

        it('should be callable for admin', function (done) {
            checkMethodForRole('admin', 'deleteUserById', id);
            done();
        });

        it('should not be callable for other roles but admin ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodForRole(role, 'deleteUserById', id);
                }, errors.AuthenticationError);
            });
            done();
        });

        it('should throw an error when deleting me', function (done) {
            var userRepositoryStub = sinon.stub(new UserRepository());
            var authService = authTestUtil.authorizationServiceForUserWitRole("admin");
            var authorizationRepository = new UserAuthorizationRepository(errors, userRepositoryStub, authService);

            errorEvaluation.evaluateExecption(function () {
                authorizationRepository.deleteUserById(authService.getCurrentUser()._id);
            }, errors.AuthenticationError);
            done();
        });
    });

    describe('deleteInaktiveUserById()', function () {

        var id = sinon.spy();

        it('should be callable for admin', function (done) {
            checkMethodForRole('admin', 'deleteInaktiveUserById', id);
            done();
        });

        it('should not be callable for other roles but admin ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodForRole(role, 'deleteInaktiveUserById', id);
                }, errors.AuthenticationError);
            });
            done();
        });
    });

    describe('verifyPasswordById()', function () {

        var id = sinon.spy();
        var password = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodForRole(role, 'verifyPasswordById', id, password);
            });
            done();
        });

    });

    describe('changePasswordById()', function () {

        var id = sinon.spy();
        var oldPassword = sinon.spy();
        var newPassword = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodForRole(role, 'changePasswordById', id, oldPassword, newPassword);
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

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodForRole(role, 'getUsers', options);
            });
            done();
        });

    });

});