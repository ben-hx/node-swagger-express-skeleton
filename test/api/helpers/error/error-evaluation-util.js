var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function (errors) {
    return {
        evaluateExecption: function (func, expectedExceptionInstance) {
            try {
                func()
                should.fail();
            }
            catch (err) {
                err.should.be.an.instanceOf(expectedExceptionInstance);
            }
        },
        evaluateIllegalArgumentError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.IllegalArgumentError);
        },
        evaluateValidationError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.ValidationError);
        },
        evaluateAuthenticationError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.AuthenticationError);
        },
        evaluateNotFoundError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.NotFoundError);
        },
        evaluateDuplicationError: function (actualError, expectedError) {
            actualError.should.be.an.instanceOf(errors.DuplicationError);
        }
    }
};
