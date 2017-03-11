'use strict';
var chai = require('chai');
var should = chai.should();
var sinon = require("sinon");
chai.use(require("sinon-chai"));

describe('Movie-Property-Authorization-Repository-Tests', function () {

    var testFactory = require("../../../helpers/test-factory")();
    var errors = require("../../../../../errors/errors");
    var errorEvaluation = testFactory.errorEvaluation();
    var authTestUtil = testFactory.authTestUtil();
    var MoviePropertyAuthorizationRepository = require("../../../../../repositories/authorization-decorators/movie-property-repository");
    var MoviePropertyRepository = require("../../../../../repositories/movie-property-repository");

    function checkMethodCalledWithArgumentsForRole(role, methodName, args) {
        var repositoryStub = sinon.stub(new MoviePropertyRepository());
        var authorizationRepository = new MoviePropertyAuthorizationRepository(repositoryStub, authTestUtil.authorizationServiceForUserWitRole(role));
        var args = Array.prototype.slice.call(arguments, 2);
        authorizationRepository[methodName].apply(this, args);
        repositoryStub[methodName].should.have.been.calledOnce;
        var calledArguments = repositoryStub[methodName].getCall(0).args;
        for (var i; i < calledArguments.length; i++) {
            calledArguments[i].should.be.equal(args[i]);
        }
    }

    describe('getGenres()', function () {

        var options = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getGenres');
            });
            done();
        });

    });

    describe('getDirectors()', function () {

        var options = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getDirectors');
            });
            done();
        });

    });

    describe('getWriters()', function () {

        var options = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getWriters');
            });
            done();
        });

    });

    describe('getActors()', function () {

        var options = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getActors');
            });
            done();
        });

    });

    describe('getLanguages()', function () {

        var options = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getLanguages');
            });
            done();
        });

    });

    describe('getTags()', function () {

        var options = sinon.spy();

        it('should be callable for everybody', function (done) {
            var roles = authTestUtil.allPossibleRoles();
            roles.forEach(function (role) {
                checkMethodCalledWithArgumentsForRole(role, 'getTags');
            });
            done();
        });

    });

});