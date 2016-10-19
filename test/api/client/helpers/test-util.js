var chai = require('chai');
var supertest = require('supertest');
var expect = chai.expect;
var should = chai.should();
var testConfig = require('../test-config');

module.exports = {

    evaluateUserResponse: function (userResponse, user) {
        userResponse.username.should.equal(user.username);
    },

    evaluateErrorResponse: function (response, statusCode) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(false);
    }

};
