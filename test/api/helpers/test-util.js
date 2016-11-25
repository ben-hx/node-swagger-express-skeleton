var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var q = require('q');

module.exports = function (config, errors, UserRepository) {
    return {
        registerExampleUser: function (user) {
            return UserRepository.register(user).then(function (resolvedUser) {
                user._id = resolvedUser._id;
                return resolvedUser;
            });
        },

        registerExampleUsers: function (users) {
            var promises = [];
            var self = this;
            users.forEach(function (user) {
                promises.push(self.registerExampleUser(user));
            });
            return q.all(promises);
        },

        activateExampleUser: function (user) {
            return UserRepository.activate(user).then(function (resolvedUser) {
                user._id = resolvedUser._id;
                return resolvedUser;
            });
        },

        setRoleToExampleUser: function (user, role) {
            return UserRepository.setRole(user, role);
        },

        getInaktiveExampleUsers: function (query, sort, pagination) {
            return UserRepository.getInaktiveUsers(query, sort, pagination);
        },

        getExampleUsers: function (query, sort, pagination) {
            return UserRepository.getUsers(query, sort, pagination);
        },

        evaluateInaktiveUser: function (actualUser, expectedUser) {
            actualUser.email.should.equal(expectedUser.email);
            actualUser.username.should.equal(expectedUser.username);
        },

        evaluateUser: function (actualUser, expectedUser) {
            actualUser.email.should.equal(expectedUser.email);
            actualUser.username.should.equal(expectedUser.username);
            actualUser.role.should.equal(expectedUser.role);
        },

        evaluateUsers: function (actualUsers, expectedUsers) {
            actualUsers.forEach(function (user) {
                delete user.password;
            });
            expectedUsers.should.deep.include.members(expectedUsers);
        },

        evaluateMinimalUser: function (actualUser, expectedUser) {
            actualUser.email.should.equal(expectedUser.email);
        },

        evaluatePagination: function (actual, expected) {
            actual.page.should.equal(expected.limit);
            actual.limit.should.equal(expected.limit);
            actual.totalCount.should.equal(expected.totalCount);
            actual.totalPages.should.equal(expected.totalPages);
        },

        evaluateValidationError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.ValidationError);
        },
        evaluateNotFoundError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.NotFoundError);
        }

    }
};
