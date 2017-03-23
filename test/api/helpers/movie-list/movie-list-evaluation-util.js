var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function () {
    return {
        evaluateMovieListArray: function (actual, expected) {
            actual.should.have.length(expected.length);
            actual.forEach(function (actualItem) {
                expected.forEach(function (expectedItem) {
                    if (actualItem._id == expectedItem._id) {
                        evaluateMovie(actualItem, expectedItem);
                    }
                });
            });
        },
        evaluateMovieListItem: function (actual, expected) {
            actual.title.should.equal(expected.title);
            actual.description.should.equal(expected.description);
            actual.access.should.equal(expected.access);
            actual.tags.should.deep.equal(expected.tags);
            actual.should.have.property('created');
            actual.should.have.property('createdUser');
            var actualMovieIds = [];
            actual.movies.forEach(function (actual) {
                actualMovieIds.push({id: actual.movie._id});
            });
            var expectedMovieIds = [];
            expected.movies.forEach(function (expected) {
                expectedMovieIds.push({id: expected.movie._id});
            });
            expectedMovieIds.should.deep.include.members(actualMovieIds);

            var actualUserIds = [];
            actual.editableUsers.forEach(function (actual) {
                actualUserIds.push({id: actual.user._id});
            });
            var expectedUserIds = [];
            expected.editableUsers.forEach(function (expected) {
                expectedUserIds.push({id: expected.user._id});
            });
            expectedUserIds.should.deep.include.members(actualUserIds);
        },

        evaluateMovieListComment: function (actual, expected) {
            expected.user._id.equals(actual.user._id).should.be.true;
            expected.text.should.equals(actual.text);
        },

        evaluateMovieListComments: function (actual, expected) {
            var actualUserIdsWithText = [];
            actual.comments.forEach(function (comment) {
                actualUserIdsWithText.push({userId: comment.user._id, text: comment.text});
            });
            var expectedUserIdsWithText = [];
            expected.comments.forEach(function (comment) {
                expectedUserIdsWithText.push({userId: comment.user._id, text: comment.text});
            });
            expectedUserIdsWithText.should.deep.include.members(actualUserIdsWithText);
        }
    }
};
