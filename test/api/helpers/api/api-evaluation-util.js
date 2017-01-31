var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function () {
    return {
        evaluateUserResponse: function (response, statusCode, expectedUser) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.user.email.should.equal(expectedUser.email);
            response.body.data.user.username.should.equal(expectedUser.username);
        },

        evaluateSuccessfulRegisterResponse: function (response, statusCode, expectedUser) {
            this.evaluateUserResponse(response, statusCode, expectedUser);
        },

        evaluateSuccessfulMinimalRegisterResponse: function (response, statusCode, expectedUser) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.user.email.should.equal(expectedUser.email);
        },

        evaluateUsersResponse: function (response, statusCode, expectedUsers) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.users.forEach(function (user) {
                delete user._id;
                delete user.password;
                delete user.lastModified;
            });
            expectedUsers.forEach(function (user) {
                delete user._id;
                delete user.password;
                delete user.lastModified;
            });
            expectedUsers.should.deep.include.members(response.body.data.users);
        },

        evaluateInaktiveUsersResponse: function (response, statusCode, expectedUsers) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.users.forEach(function (user) {
                delete user._id;
                delete user.role;
                delete user.password;
                delete user.lastModified;
            });
            expectedUsers.forEach(function (user) {
                delete user._id;
                delete user.role;
                delete user.password;
                delete user.lastModified;
            });
            expectedUsers.should.deep.include.members(response.body.data.users);
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
        evaluateMovies: function (actual, expected) {
            var self = this;
            actual.should.have.length(expected.length);
            actual.forEach(function (actualMovie) {
                expected.forEach(function (expectedMovie) {
                    if (actualMovie._id == expectedMovie._id) {
                        self.evaluateMovie(actualMovie, expectedMovie);
                    }
                });
            });
        },

        evaluateMovieResponse: function (response, statusCode, expectedMovie, expectedUserCreatedBy) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.movie.lastModifiedUser.should.equal(String(expectedUserCreatedBy._id));
            this.evaluateMovie(response.body.data.movie, expectedMovie);
        },

        evaluateMovieActionResponse: function (response, statusCode, expectedAction) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            this.evaluateMovie(response.body.data.movie, expectedAction.movie);
            if (expectedAction.ownWatched) {
                response.body.data.movie.ownWatched.value.should.equal(expectedAction.ownWatched.value);
            }
            if (expectedAction.userWatched) {
                response.body.data.movie.userWatched.forEach(function (actualWatched) {
                    var actualUser = actualWatched.user;
                    var located = false;
                    expectedAction.userWatched.forEach(function (expectedUser) {
                        if (actualUser._id == expectedUser._id) {
                            located = true;
                            actualUser.email.should.equal(expectedUser.email);
                        }
                    });
                    located.should.be.true;
                });
            }
            if (expectedAction.ownRating) {
                if (expectedAction.ownRating == null) {
                    expect(response.body.data.movie.ownRating).to.be.null;
                } else {
                    response.body.data.movie.ownRating.value.should.equal(expectedAction.ownRating.value);
                }
            }
            if (expectedAction.averageRating) {
                if (expectedAction.averageRating == null) {
                    expect(response.body.data.movie.averageRating).to.be.null;
                } else {
                    response.body.data.movie.averageRating.should.equal(expectedAction.averageRating);
                }
            }
            if (expectedAction.userRatings) {
                response.body.data.movie.userRatings.forEach(function (actualRating) {
                    var located = false;
                    expectedAction.userRatings.forEach(function (expectedRating) {
                        if (actualRating.user._id == expectedRating.user._id) {
                            located = true;
                            actualRating.user.email.should.equal(expectedRating.user.email);
                        }
                    });
                    located.should.be.true;
                });
            }
        },

        evaluateMoviesResponse: function (response, statusCode, expectedMovies) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            this.evaluateMovies(response.body.data.movies, expectedMovies);
        },

        evaluateMovieWatchedResponse: function (response, statusCode, expectedMovieWatched) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.movie.should.equal(expectedMovieWatched.movie);
            response.body.data.watched.value.should.equal(expectedMovieWatched.watched.value);
        },

        evaluateMovieRatingResponse: function (response, statusCode, expectedMovieRating) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.movie.should.equal(expectedMovieRating.movie);
            if (response.body.data.rating.value == null) {
                expect(response.body.data.rating.value).to.be.null;
            } else {
                response.body.data.rating.value.should.equal(expectedMovieRating.rating.value);
            }
            response.body.data.averageRating.value.should.be.closeTo(expectedMovieRating.averageRating.value, 0.001);
        },


        evaluateSuccessfulMoviesPaginationResponse: function (response, statusCode, expectedData) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.movies.length.should.equal(expectedData.count);
            response.body.data.pagination.limit.should.equal(expectedData.limit);

            response.body.data.pagination.totalCount.should.equal(expectedData.totalCount);
            response.body.data.pagination.totalPages.should.equal(expectedData.totalPages);

        },

        evaluateSuccessfulMovieRatingResponse: function (response, statusCode, movieRating) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.ownRating.should.equal(movieRating.ownRating);
            response.body.data.averageRating.should.be.closeTo(movieRating.averageRating, 0.001);
        },

        evaluateSuccessfulMovieUsersRatingResponse: function (response, statusCode, movieRating) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            var sumRating = 0;
            var ratingCount = 0;
            var userIdsWithRating = [];
            for (var i in movieRating.usersRating) {
                var value = movieRating.usersRating[i];
                ratingCount++;
                ratingCount = ratingCount + value.rating;
                userIdsWithRating.push({userid: value.user._id, rating: value.ownRating});
            }
            if (movieRating.ownRating == null) {
                expect(response.body.data.ownRating).to.be.null;
            } else {
                response.body.data.ownRating.should.equal(movieRating.ownRating);
            }
            response.body.data.averageRating.should.be.closeTo(movieRating.averageRating, 0.001);
            response.body.data.usersRating.should.deep.include.members(userIdsWithRating)
        },

        evaluateSuccessfulMovieWatchedResponse: function (response, statusCode, movieWatched) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.movieId.should.equal(movieWatched.movieId);
            response.body.data.watched.should.equal(movieWatched.watched);
        },

        evaluateSuccessfulMovieUsersWatchedResponse: function (response, statusCode, users) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            var userIds = [];
            for (var i in users) {
                value = users[i];
                userIds.push(value._id);
            }
            response.body.data.users.should.deep.include.members(userIds)
        },

        evaluateSuccessfulGenresResponse: function (response, statusCode, genres) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data.genres.should.deep.include.members(genres);
        },

        evaluateSuccessfulMoviePropertyResponse: function (propertyName, response, statusCode, values) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(true);
            response.body.data[propertyName].should.deep.include.members(values);
        },

        evaluateErrorResponse: function (response, statusCode) {
            response.status.should.equal(statusCode);
            response.body.success.should.equal(false);
        }
    }
};
