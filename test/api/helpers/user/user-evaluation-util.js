var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function () {
    return {
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
        }

    }
};
