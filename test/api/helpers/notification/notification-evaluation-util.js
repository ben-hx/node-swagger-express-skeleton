var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function () {
    return {
        evaluateNotificationArray: function (actual, expected) {
            actual.should.have.length(expected.length);
            actual.forEach(function (actualItem) {
                expected.forEach(function (expectedItem) {
                    if (actualItem._id == expectedItem._id) {
                        evaluateMinimalNotification(actualItem, expectedItem);
                    }
                });
            });
        },
        evaluateNotification: function (actual, expected) {
            actual.verb.should.equal(expected.verb);
            actual.message.should.equal(expected.message);
            if (actual.messageTemplates) {
                actual.messageTemplates.should.deep.equal(expected.messageTemplates);
            }
            actual.should.have.property('date');
            actual.should.have.property('createdUser');
        },
        evaluateMinimalNotification: function (actual, expected) {
            actual.verb.should.equal(expected.verb);
            actual.message.should.equal(expected.message);
            actual.should.have.property('date');
            actual.should.have.property('createdUser');
        }
    }
};
