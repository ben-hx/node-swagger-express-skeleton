var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function () {
    return {
        evaluateMovies: function (actual, expected) {
            actual.should.have.length(expected.length);
            actual.forEach(function (actualMovie) {
                expected.forEach(function (expectedMovie) {
                    if (actualMovie._id == expectedMovie._id) {
                        evaluateMovie(actualMovie, expectedMovie);
                    }
                });
            });
        },


        evaluateMovie: function (actual, expected) {
            actual.title.should.equal(expected.title);
            actual.year.should.equal(expected.year);
            actual.runtime.should.equal(expected.runtime);
            actual.genres.should.deep.equal(expected.genres);
            actual.directors.should.deep.equal(expected.directors);
            actual.writers.should.deep.equal(expected.writers);
            actual.actors.should.deep.equal(expected.actors);
            actual.plot.should.equal(expected.plot);
            actual.languages.should.deep.equal(expected.languages);
            actual.country.should.equal(expected.country);
            actual.poster.should.equal(expected.poster);
        },
        evaluateMinimalMovie: function (actual, expected) {
            actual.title.should.equal(expected.title);
            actual.year.should.equal(expected.year);
            actual.runtime.should.equal(expected.runtime);
            actual.genres.should.deep.equal(expected.genres);
            actual.directors.should.deep.equal(expected.directors);
            actual.writers.should.deep.equal(expected.writers);
            actual.actors.should.deep.equal(expected.actors);
            actual.plot.should.equal(expected.plot);
            actual.languages.should.deep.equal(expected.languages);
        },
        evaluateMovieWatched: function (actual, expected) {
            actual.ownWatched.value.should.equal(expected.ownWatched.value);
            var actualUserIds = [];
            actual.userWatched.forEach(function (actualUserWatched) {
                actualUserIds.push(actualUserWatched.user._id);
            });
            var expectedUserIds = [];
            expected.userWatched.forEach(function (expectedUserWatched) {
                expectedUserIds.push(expectedUserWatched._id);
            });
            expectedUserIds.should.deep.include.members(actualUserIds);
        },
        evaluateMovieRating: function (actual, expected) {
            if (expected.ownRating == null) {
                expect(actual.ownRating).to.be.null;
            } else {
                actual.ownRating.value.should.equal(expected.ownRating.value);
            }
            if (expected.averageRating == null) {
                expect(actual.averageRating).to.be.null;
            } else {
                actual.averageRating.should.equal(expected.averageRating);
            }

            var actualUserIdsWithValue = [];
            actual.userRatings.forEach(function (actualUserRating) {
                actualUserIdsWithValue.push({userId: actualUserRating.user._id, value: actualUserRating.value});
            });
            var expectedUserIdsWithValue = [];
            expected.userRatings.forEach(function (expectedUserRating) {
                expectedUserIdsWithValue.push({userId: expectedUserRating.user._id, value: expectedUserRating.value});
            });
            expectedUserIdsWithValue.should.deep.include.members(actualUserIdsWithValue);
        },


        evaluateUserIdsMovieWatched: function (actual, expected) {
            actual.should.have.length(expected.length);
            actual.should.deep.include.members(expected)
        },
        evaluateMovieIdsUserWatched: function (actual, expected) {
            actual.should.have.length(expected.length);
            actual.should.deep.include.members(expected);
        },
        evaluateMovieRating2: function (actual, expected) {
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
