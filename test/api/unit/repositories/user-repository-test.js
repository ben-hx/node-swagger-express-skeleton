'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('User-Repository-Tests', function () {

    var User = require("../../../../models/user");
    var InaktiveUser = require("../../../../models/inaktive-user");

    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var dbTestUtil = testFactory.dbTestUtil();
    var userEvaluation = testFactory.userEvaluation();
    var errorEvaluation = testFactory.errorEvaluation();
    var userRepositoryTestUtil = testFactory.userTestUtil().repositoryDecorator;

    before(dbTestUtil.setUpDb);

    after(dbTestUtil.tearDownDb);

    beforeEach(function (done) {
        exampleUsers = testFactory.exampleData.generateUsers();
        q.all([
            User.remove(),
            InaktiveUser.remove()
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            User.remove(),
            InaktiveUser.remove()
        ]).then(function () {
            done();
        });
    });

    describe('register()', function () {

        it('should return a user when registering with valid user-data', function (done) {
            userRepositoryTestUtil.registerExampleUser(exampleUsers.bob).then(function (user) {
                userEvaluation.evaluateInaktiveUser(user, exampleUsers.bob);
                done();
            });
        });

        it('should return a user when registering with minimal-user-data', function (done) {
            userRepositoryTestUtil.registerExampleUser(exampleUsers.minimal).then(function (user) {
                userEvaluation.evaluateMinimalUser(user, exampleUsers.minimal);
                done();
            });
        });

        it('should return a validation-error-callback when registering a user with no credentials', function (done) {
            userRepositoryTestUtil.registerExampleUser({}).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when registering a user with no email', function (done) {
            userRepositoryTestUtil.registerExampleUser({password: 'bob'}).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when registering a user with no password', function (done) {
            userRepositoryTestUtil.registerExampleUser({email: 'bob'}).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when registering a user with invalid email', function (done) {
            var user = {
                username: 'invalid',
                email: 'invalid',
                password: 'invalid'
            };
            userRepositoryTestUtil.registerExampleUser(user).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when registering two users with the same username', function (done) {
            var user1 = exampleUsers.bob;
            var user2 = {
                username: exampleUsers.bob.username,
                email: 'invalid@invalid.de',
                password: 'invalid'
            };
            userRepositoryTestUtil.registerExampleUser(user1).then(function () {
                return userRepositoryTestUtil.registerExampleUser(user2);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when registering two users with the same email', function (done) {
            var user1 = exampleUsers.bob;
            var user2 = {
                username: 'invalid',
                email: exampleUsers.bob.email,
                password: 'invalid'
            };
            userRepositoryTestUtil.registerExampleUser(user1).then(function () {
                return userRepositoryTestUtil.registerExampleUser(user2);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

    });

    describe('create()', function () {

        it('should return a user when creating with valid user-data', function (done) {
            userRepositoryTestUtil.createExampleUser(exampleUsers.bob).then(function (user) {
                userEvaluation.evaluateUser(user, exampleUsers.bob);
                done();
            });
        });

        it('should return a user when creating with minimal-user-data', function (done) {
            userRepositoryTestUtil.createExampleUser(exampleUsers.minimal).then(function (user) {
                userEvaluation.evaluateMinimalUser(user, exampleUsers.minimal);
                done();
            });
        });

        it('should return a validation-error-callback when creating a user with no credentials', function (done) {
            userRepositoryTestUtil.createExampleUser({}).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when creating a user with no email', function (done) {
            userRepositoryTestUtil.createExampleUser({password: 'bob'}).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when creating a user with no password', function (done) {
            userRepositoryTestUtil.createExampleUser({email: 'bob'}).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when creating a user with invalid email', function (done) {
            var user = {
                username: 'invalid',
                email: 'invalid',
                password: 'invalid'
            };
            userRepositoryTestUtil.createExampleUser(user).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when creating two users with the same username', function (done) {
            var user1 = exampleUsers.bob;
            var user2 = {
                username: exampleUsers.bob.username,
                email: 'invalid@invalid.de',
                password: 'invalid'
            };
            userRepositoryTestUtil.createExampleUser(user1).then(function () {
                return userRepositoryTestUtil.createExampleUser(user2);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a validation-error-callback when creating two users with the same email', function (done) {
            var user1 = exampleUsers.bob;
            var user2 = {
                username: 'invalid',
                email: exampleUsers.bob.email,
                password: 'invalid'
            };
            userRepositoryTestUtil.createExampleUser(user1).then(function () {
                return userRepositoryTestUtil.createExampleUser(user2);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

    });

    describe('updateById()', function () {

        it('should return a user when updating with user-data', function (done) {
            q.all([
                userRepositoryTestUtil.createExampleUser(exampleUsers.bob)
            ]).then(function () {
                exampleUsers.bob.username = "bob2";
                return userRepositoryTestUtil.updateExampleUserById(exampleUsers.bob._id, exampleUsers.bob);
            }).then(function (result) {
                userEvaluation.evaluateUser(result, exampleUsers.bob);
                done();
            });
        });

        it('should return a user when updating nothing', function (done) {
            q.all([
                userRepositoryTestUtil.createExampleUser(exampleUsers.bob)
            ]).then(function () {
                return userRepositoryTestUtil.updateExampleUserById(exampleUsers.bob._id, exampleUsers.bob);
            }).then(function (result) {
                userEvaluation.evaluateUser(result, exampleUsers.bob);
                done();
            });
        });

        it('should return an error when updating a user with username that already exists', function (done) {
            q.all([
                userRepositoryTestUtil.createExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.createExampleUser(exampleUsers.alice)
            ]).then(function () {
                exampleUsers.bob.username = "alice";
                return userRepositoryTestUtil.updateExampleUserById(exampleUsers.bob._id, exampleUsers.bob);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should not update the password when updating with password-field', function (done) {
            q.all([
                userRepositoryTestUtil.createExampleUser(exampleUsers.bob)
            ]).then(function () {
                return userRepositoryTestUtil.updateExampleUserById(exampleUsers.bob._id, {password: 'myNewValidPassword'});
            }).then(function (result) {
                userEvaluation.evaluateUser(result, exampleUsers.bob);
                done();
            });
        });

        it('should return an error when updating with invalid user-data', function (done) {
            userRepositoryTestUtil.updateExampleUserById(exampleUsers.bob._id, exampleUsers.bob).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('changePasswordById() and verifyPasswordById()', function () {

        it('should return true when updating with valid old and new password', function (done) {
            var newPassword = "bobsNewPassword";
            q.all([
                userRepositoryTestUtil.createExampleUser(exampleUsers.bob)
            ]).then(function () {
                return userRepositoryTestUtil.changeExampleUsersPasswordById(exampleUsers.bob._id, exampleUsers.bob.password, newPassword);
            }).then(function (result) {
                return userRepositoryTestUtil.verifyExampleUsersPasswordById(exampleUsers.bob._id, newPassword);
            }).then(function (result) {
                result.isMatch.should.equal(true);
                done();
            });
        });

        it('should return an error when updating with invalid old password', function (done) {
            var newPassword = "bobsNewPassword";
            q.all([
                userRepositoryTestUtil.createExampleUser(exampleUsers.bob)
            ]).then(function () {
                return userRepositoryTestUtil.changeExampleUsersPasswordById(exampleUsers.bob._id, exampleUsers.bob.password + 'asd', newPassword);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

    });

    describe('activateById()', function () {

        it('should return a user when activating him', function (done) {
            userRepositoryTestUtil.registerExampleUser(exampleUsers.bob).then(function (user) {
                return userRepositoryTestUtil.activateExampleUser(exampleUsers.bob);
            }).then(function (user) {
                userEvaluation.evaluateUser(user, exampleUsers.bob);
                return InaktiveUser.find();
            }).then(function (tempUsers) {
                tempUsers.should.be.empty;
                return User.find();
            }).then(function (users) {
                userEvaluation.evaluateUser(users[0], exampleUsers.bob);
                done();
            });
        });

        it('should return a not-found-error-callback when activating an invalid user', function (done) {
            userRepositoryTestUtil.activateExampleUser(exampleUsers.bob).then(function (user) {
                return userRepositoryTestUtil.activateExampleUser({});
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                return InaktiveUser.find();
            }).then(function (tempUsers) {
                tempUsers.should.be.empty;
                return User.find();
            }).then(function (users) {
                users.should.be.empty;
                done();
            });
        });

    });

    describe('getUserById()', function () {

        it('should return (aktive) user by id', function (done) {
            q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.registerExampleUser(exampleUsers.alice)
            ]).then(function (users) {
                return q.all([
                    userRepositoryTestUtil.activateExampleUser(exampleUsers.bob),
                    userRepositoryTestUtil.activateExampleUser(exampleUsers.alice)
                ]);
            }).then(function (result) {
                return userRepositoryTestUtil.getExampleUser(exampleUsers.bob);
            }).then(function (user) {
                userEvaluation.evaluateUser(user, exampleUsers.bob);
                done();
            });
        });

    });

    describe('setRoleById()', function () {

        function checkRole(role) {
            it('should return a user when setting role to ' + role, function (done) {
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob).then(function (user) {
                    return userRepositoryTestUtil.activateExampleUser(exampleUsers.bob);
                }).then(function (user) {
                    return userRepositoryTestUtil.setRoleToExampleUser(exampleUsers.bob, role);
                }).then(function (user) {
                    exampleUsers.bob.role = role;
                    userEvaluation.evaluateUser(user, exampleUsers.bob);
                    done();
                });
            });
        }

        var possibleRoles = ['admin', 'moderator', 'looser'];
        possibleRoles.forEach(function (role) {
            checkRole(role);
        });

        it('should return a validation-error-callback when setting an invalid role', function (done) {
            var role = 'someInvalidRole';
            userRepositoryTestUtil.registerExampleUser(exampleUsers.bob).then(function (user) {
                return userRepositoryTestUtil.activateExampleUser(exampleUsers.bob);
            }).then(function (user) {
                return userRepositoryTestUtil.setRoleToExampleUser(exampleUsers.bob, role);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateValidationError(error, excpectedError);
                done();
            });
        });

        it('should return a not-found-error-callback when setting a role to invalid user', function (done) {
            var role = 'someInvalidRole';
            userRepositoryTestUtil.setRoleToExampleUser(exampleUsers.bob, 'admin').catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('getInaktiveUsers()', function () {

        it('should return all inaktive users', function (done) {
            q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.registerExampleUser(exampleUsers.alice)
            ]).then(function (users) {
                return userRepositoryTestUtil.getInaktiveExampleUsers();
            }).then(function (result) {
                userEvaluation.evaluateUsers([exampleUsers.bob, exampleUsers.alice], result.users);
                done();
            });
        });

        it('should return one inaktive user, when one other is activated', function (done) {
            q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.registerExampleUser(exampleUsers.alice)
            ]).then(function (users) {
                return userRepositoryTestUtil.activateExampleUser(exampleUsers.alice);
            }).then(function (user) {
                return userRepositoryTestUtil.getInaktiveExampleUsers();
            }).then(function (result) {
                userEvaluation.evaluateUsers([exampleUsers.bob], result.users);
                done();
            });
        });

        it('should return no inaktive user when the other is activated', function (done) {
            q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob)
            ]).then(function (users) {
                return userRepositoryTestUtil.activateExampleUser(exampleUsers.bob);
            }).then(function (user) {
                return userRepositoryTestUtil.getInaktiveExampleUsers();
            }).then(function (result) {
                userEvaluation.evaluateUsers([], result.users);
                done();
            });
        });

        it('should return no inaktive user when no one is unregistered', function (done) {
            userRepositoryTestUtil.getInaktiveExampleUsers().then(function (result) {
                userEvaluation.evaluateUsers([], result.users);
                done();
            });
        });

    });

    describe('getUsers()', function () {

        it('should return all (aktive) users', function (done) {
            q.all([
                userRepositoryTestUtil.registerExampleUser(exampleUsers.bob),
                userRepositoryTestUtil.registerExampleUser(exampleUsers.alice)
            ]).then(function (users) {
                return q.all([
                    userRepositoryTestUtil.activateExampleUser(exampleUsers.bob),
                    userRepositoryTestUtil.activateExampleUser(exampleUsers.alice)
                ]);
            }).then(function (result) {
                return userRepositoryTestUtil.getExampleUsers();
            }).then(function (result) {
                userEvaluation.evaluateUsers([exampleUsers.bob, exampleUsers.alice], result.users);
                done();
            });
        });

    });

});