var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function (errors) {
    return {
        evaluateValidationError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.ValidationError);
        },
        evaluateNotFoundError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.NotFoundError);
        },
        evaluateDuplicationError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.DuplicationError);
        }
    }
};
