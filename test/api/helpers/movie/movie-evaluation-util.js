var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function () {
    return {
        evaluateMovies: function (actual, expected) {
            actual.should.have.length(expected.length);
            actual.should.deep.include.members(expected);
        },
        evaluateMovie: function (actual, expected) {
            actual.should.deep.equal(expected);
        },
        evaluateMovieWatched: function (actual, expected) {
            String(actual.movie).should.equal(String(expected.movie));
            String(actual.user).should.equal(String(expected.user));
            actual.watched.should.equal(expected.watched);
        },
        evaluateUserIdsMovieWatched: function (actual, expected) {
            actual.should.have.length(expected.length);
            actual.should.deep.include.members(expected)
        },
        evaluateMovieIdsUserWatched: function (actual, expected) {
            actual.should.have.length(expected.length);
            actual.should.deep.include.members(expected);
        },
        evaluateMovieRating: function (actual, expected) {
            String(actual.movie).should.equal(String(expected.movie));
            String(actual.user).should.equal(String(expected.user));
            if (actual.value == null) {
                expect(actual.value).to.be.null;
            } else {
                actual.value.should.equal(expected.value);
            }
        },
        evaluateUserIdsMovieRating: function (actual, expected) {
            actual.should.have.length(expected.length);
            actual.should.deep.include.members(expected);
        },
        evaluateUsersMovieRating: function (actual, expected) {
            function convertRatingValue(value) {
                return {
                    rating: value.rating,
                    user: {
                        email: value.user.email,
                        username: value.user.username
                    }
                }
            }
            actual = actual.map(function (value) {
                return convertRatingValue(value);
            });
            expected = expected.map(function (value) {
                return convertRatingValue(value);
            });
            actual.should.deep.include.members(expected);
        }
    }
};
