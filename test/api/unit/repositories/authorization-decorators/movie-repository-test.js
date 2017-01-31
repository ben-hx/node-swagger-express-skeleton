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
    var MovieRepository = require("../../../../../repositories/movie-repository")();

    function checkMethodCalledWithArgumentsForRole(role, methodName, args) {
        var movieRepositoryStub = sinon.stub(new MovieRepository());
        var authorizationRepository = new MovieAuthorizationRepository(movieRepositoryStub, authTestUtil.authorizationServiceForUserWitRole(role));
        var args = Array.prototype.slice.call(arguments, 2);
        authorizationRepository[methodName].apply(this, args);
        movieRepositoryStub[methodName].should.have.been.calledOnce;
        var calledArguments = movieRepositoryStub[methodName].getCall(0).args;
        for (var i; i < calledArguments.length; i++) {
            calledArguments[i].should.be.equal(args[i]);
        }
    }

    describe('create()', function () {

        function checkCreateForRole(role) {
            var movieRepositoryStub = sinon.stub(new MovieRepository());
            /*
             var movie = sinon.spy();
             var user = sinon.spy();
             var movieRepositoryStub = sinon.stub(new MovieRepository(user));
             console.log(movieRepositoryStub);


             var authorizationService = authTestUtil.authorizationServiceForUserWitRole(role);
             var authorizationRepository = new MovieAuthorizationRepository(movieRepositoryStub, authorizationService);
             authorizationRepository.create(movie);
             movieRepositoryStub.create.should.have.been.calledOnce;
             movieRepositoryStub.create.should.have.been.calledWith(movie, authorizationService.getCurrentUser());
             */
        }

        it('should be callable for admin and moderator', function (done) {
            checkCreateForRole('admin');
            checkCreateForRole('moderator');
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkCreateForRole(role);
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

        function checkUpdateForRole(role) {
            var movie = sinon.spy();
            var movieRepositoryStub = sinon.stub(new MovieRepository());
            var authorizationService = authTestUtil.authorizationServiceForUserWitRole(role);
            var authorizationRepository = new MovieAuthorizationRepository(movieRepositoryStub, authorizationService);
            authorizationRepository.updateById(1, movie);
            movieRepositoryStub.updateById.should.have.been.calledOnce;
            movieRepositoryStub.updateById.should.have.been.calledWith(1, movie, authorizationService.getCurrentUser());
        }

        it('should be callable for admin and moderatora', function (done) {
            checkUpdateForRole('admin');
            checkUpdateForRole('moderator');
            done();
        });

        it('should not be callable for other roles but admin and moderator ', function (done) {
            var roles = authTestUtil.allPossibleRolesExcept(['admin', 'moderator']);
            roles.forEach(function (role) {
                errorEvaluation.evaluateExecption(function () {
                    checkUpdateForRole(role);
                }, errors.AuthenticationError);
            });
            done();
        });

    });

    describe('deleteById()', function () {

        var movie = sinon.spy();

        it('should be callable for admin and moderatora', function (done) {
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

    describe('setWatchedByMovieIdAndUserId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'setWatchedByMovieIdAndUserId', 1, 1);
            });
            done();
        });

    });

    describe('deleteWatchedByMovieIdAndUserId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'deleteWatchedByMovieIdAndUserId', 1, 1);
            });
            done();
        });

    });

    describe('getWatchedByMovieIdAndUserId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getWatchedByMovieIdAndUserId', 1, 1);
            });
            done();
        });

    });

    describe('getUsersWatchedByMovieId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getUsersWatchedByMovieId', 1, {});
            });
            done();
        });

    });

    describe('getMoviesWatchedByUserId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getMoviesWatchedByUserId', 1, {});
            });
            done();
        });

    });

    describe('setRatingByMovieIdAndUserId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'setRatingByMovieIdAndUserId', 1, {}, 2);
            });
            done();
        });

    });

    describe('deleteRatingByMovieIdAndUserId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'deleteRatingByMovieIdAndUserId', 1, {});
            });
            done();
        });

    });

    describe('getAverageRatingByMovieId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getAverageRatingByMovieId', 1);
            });
            done();
        });

    });

    describe('getUsersRatingByMovieId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getUsersRatingByMovieId', 1, {});
            });
            done();
        });

    });

    describe('getRatingByMovieIdAndUserId()', function () {

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getRatingByMovieIdAndUserId', 1, 1);
            });
            done();
        });

    });

});