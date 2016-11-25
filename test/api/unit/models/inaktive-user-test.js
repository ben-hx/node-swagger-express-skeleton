'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('InaktiveUser-Model-Tests', function () {

    var errors = require("../../../../errors/errors");
    var generateExampleUsers = require("../../helpers/example-users").generate;
    var exampleUsers = generateExampleUsers();
    var User = require("../../../../models/user");
    var InaktiveUser = require("../../../../models/inaktive-user");

    var dbTestUtil = require('../../helpers/db/db-test-util')();
    var userEvaluation = require('../../helpers/user/user-evaluation-util')();
    var errorEvaluation = require('../../helpers/error/error-evaluation-util')(errors);

    before(dbTestUtil.setUpDb);

    after(dbTestUtil.tearDownDb);

    beforeEach(function (done) {
        exampleUsers = generateExampleUsers();
        q.all([
            User.remove(),
            InaktiveUser.remove(),
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            User.remove(),
            InaktiveUser.remove(),
        ]).then(function () {
            done();
        });
    });

    describe('save()', function () {

        it('should return an user when saving with valid user-data', function (done) {
            var user = new InaktiveUser(exampleUsers.bob);
            user.save().then(function (result) {
                userEvaluation.evaluateInaktiveUser(result, exampleUsers.bob);
                done();
            });
        });

        it('should return an user (with default role=looser) when saving with minimal-user-data', function (done) {
            var user = new InaktiveUser(exampleUsers.minimal);
            user.save().then(function (result) {
                userEvaluation.evaluateMinimalUser(result, exampleUsers.minimal);
                done();
            });
        });

        it('should return an error when saving a user with no credentials', function (done) {
            var user = new InaktiveUser({});
            user.save().catch(function () {
                done();
            });
        });

        it('should return an error when saving a user with no email', function (done) {
            var user = new InaktiveUser({password: 'bob'});
            user.save().catch(function () {
                done();
            });
        });

        it('should return an error when registering a user with no password', function (done) {
            var user = new InaktiveUser({email: 'bob@test.de'});
            user.save().catch(function () {
                done();
            });
        });

        it('should return an error when saving a user with invalid email', function (done) {
            var user = {
                username: 'invalid',
                email: 'invalid',
                password: 'invalid'
            };
            var user = new InaktiveUser(user);
            user.save().catch(function () {
                done();
            });
        });

        it('should return am error when saving two users with the same username', function (done) {
            var user1 = exampleUsers.bob;
            var user2 = {
                username: exampleUsers.bob.username,
                email: 'invalid@invalid.de',
                password: 'invalid'
            };
            (new InaktiveUser(user1)).save().then(function () {
                return (new User(user2)).save();
            }).catch(function (error) {
                done();
            });
        });

        it('should return an error when saving two users with the same email', function (done) {
            var user1 = exampleUsers.bob;
            var user2 = {
                username: 'invalid',
                email: exampleUsers.bob.email,
                password: 'invalid'
            };
            (new InaktiveUser(user1)).save().then(function () {
                return (new User(user2)).save();
            }).catch(function (error) {
                done();
            });
        });

    });

    describe('Plugin: toObjectTransformation', function () {

        it('should return an transformed user when calling toObject', function (done) {
            var user = new InaktiveUser(exampleUsers.bob);
            user.save().then(function (result) {
                var transformedUser = result.toObject();
                transformedUser.email.should.equal(exampleUsers.bob.email);
                transformedUser.username.should.equal(exampleUsers.bob.username);
                transformedUser.should.not.have.ownProperty('password');
                transformedUser.should.not.have.ownProperty('__v');
                transformedUser.should.have.ownProperty('_id');
                done();
            });
        });

    });

    describe('Plugin: lastModified', function () {

        it('should return an user with lastModified-field when saving Object', function (done) {
            var user = new InaktiveUser(exampleUsers.bob);
            user.save().then(function (result) {
                var transformedUser = result.toObject();
                transformedUser.should.have.ownProperty('lastModified');
                done();
            });
        });

    });

});