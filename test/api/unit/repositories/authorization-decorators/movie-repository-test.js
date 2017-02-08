'use strict';
var chai = require('chai');
var should = chai.should();
var sinon = require("sinon");
chai.use(require("sinon-chai"));

describe('Movie-Authorization-Repository-Tests', function () {

    var testFactory = require("../../../helpers/test-factory")();
    var errors = require("../../../../../errors/errors");
    var errorEvaluation = testFactory.errorEvaluation();
    var authTestUtil = testFactory.authTestUtil();
    var MovieAuthorizationRepository = require("../../../../../repositories/authorization-decorators/movie-repository");

    function getObjectWithSpyArgument(argumentName) {
        var result = {};
        result[argumentName] = sinon.spy();
        return result;
    }

    function checkMethodCalledWithArgumentsForRole(role, methodName, args) {
        var movieRepository = getObjectWithSpyArgument(methodName);
        var authorizationRepository = new MovieAuthorizationRepository(movieRepository, authTestUtil.authorizationServiceForUserWitRole(role));
        var args = Array.prototype.slice.call(arguments, 2);
        authorizationRepository[methodName].apply(this, args);
        movieRepository[methodName].should.have.been.calledOnce;
        var calledArguments = movieRepository[methodName].getCall(0).args;
        for (var i; i < calledArguments.length; i++) {
            calledArguments[i].should.be.equal(args[i]);
        }
    }

    describe('create()', function () {

        var movie = sinon.spy();

        it('should be callable for admin and moderator', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'create', movie);
            checkMethodCalledWithArgumentsForRole('moderator', 'create', movie);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'create', movie);
                }, errors.AuthenticationError);
            });
            done();
        });
    });

    describe('getAll()', function () {

        var options = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getAll', options);
            });
            done();
        });

    });

    describe('getById()', function () {

        var options = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getById', options);
            });
            done();
        });

    });

    describe('updateById()', function () {

        var movie = sinon.spy();

        it('should be callable for admin and moderatora', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'updateById', 1, movie);
            checkMethodCalledWithArgumentsForRole('moderator', 'updateById', 1, movie);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'updateById', 1, movie);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('deleteById()', function () {

        var movie = sinon.spy();

        it('should be callable for admin and moderator', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'deleteById', 1, movie);
            checkMethodCalledWithArgumentsForRole('moderator', 'deleteById', 1, movie);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'deleteById', 1, movie);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('setWatchedById()', function () {

        it('should be callable for admin and moderator', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'setWatchedById', 1);
            checkMethodCalledWithArgumentsForRole('moderator', 'setWatchedById', 1);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'setWatchedById', 1);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('deleteWatchedById()', function () {

        it('should be callable for admin and moderator', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'deleteWatchedById', 1);
            checkMethodCalledWithArgumentsForRole('moderator', 'deleteWatchedById', 1);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'deleteWatchedById', 1);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('setRatingById()', function () {

        it('should be callable for admin and moderator', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'setRatingById', 1, 2);
            checkMethodCalledWithArgumentsForRole('moderator', 'setRatingById', 1, 2);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'setRatingById', 1, 2);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('deleteRatingById()', function () {

        it('should be callable for admin and moderator', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'deleteRatingById', 1);
            checkMethodCalledWithArgumentsForRole('moderator', 'deleteRatingById', 1);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'deleteRatingById', 1);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('addCommentById()', function () {

        it('should be callable for admin and moderator', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'addCommentById', 1, "asdf");
            checkMethodCalledWithArgumentsForRole('moderator', 'addCommentById', 1, "asdf");
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'addCommentById', 1, "asdf");
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('deleteCommentById()', function () {

        it('should be callable for admin and moderator', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'deleteCommentById', 1, 1);
            checkMethodCalledWithArgumentsForRole('moderator', 'deleteCommentById', 1, 1);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'deleteCommentById', 1, 1);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('deleteCommentFromUserById()', function () {

        it('should be callable for admin', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'deleteCommentFromUserById', 1, 1);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'deleteCommentFromUserById', 1, 1);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('getCommentById()', function () {

        it('should be callable for admin and moderator', function (done) {
            checkMethodCalledWithArgumentsForRole('admin', 'getCommentById', 1, 1);
            checkMethodCalledWithArgumentsForRole('moderator', 'getCommentById', 1, 1);
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkMethodCalledWithArgumentsForRole(role, 'getCommentById', 1, 1);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

});