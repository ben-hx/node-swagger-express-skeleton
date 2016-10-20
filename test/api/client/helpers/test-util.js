var chai = require('chai');
var should = chai.should();
var testConfig = require('../test-config');

module.exports = {

    evaluateSuccessfulUserResponse: function (response, statusCode, user) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(true);
        response.body.data.username.should.equal(user.username);
    },

    evaluateErrorResponse: function (response, statusCode) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(false);
    }

};
