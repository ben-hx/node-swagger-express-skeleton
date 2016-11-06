var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var expect = chai.expect;
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);


module.exports = {

    evaluateSuccessfulUserResponse: function (response, statusCode, user) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(true);
        response.body.data.user.username.should.equal(user.username);
    },

    evaluateSuccessfulMovieResponse: function (response, statusCode, movie, user) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(true);
        response.body.data.movie.title.should.equal(movie.title);
        response.body.data.movie.userCreatedId.should.equal(user._id);
        delete response.body.data.movie.userCreatedId;
        response.body.data.movie.should.deep.equal(movie);
    },

    evaluateSuccessfulMoviesResponse: function (response, statusCode, movies) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(true);

        for (var i in response.body.data.movies) {
            value = response.body.data.movies[i];
            delete value.userCreatedId;
        }
        response.body.data.movies.should.deep.include.members(movies)
    },

    evaluateSuccessfulMovieRatingResponse: function (response, statusCode, value) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(true);
        response.body.data.ownRating.should.equal(value);
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
    },

    dropModels: function (models, done) {
        var values = models;
        var count = values.length;
        for (var key in values) {
            values[key].collection.drop(function (err) {
                --count || done();
            });
        }
    },

    registerExampleUser: function (user, done) {
        var result = api.post('/register');
        result.set('Content-Type', 'application/json');
        result.send({
            'username': user.username,
            'password': user.password
        });
        result.end(function (err, res) {
            if (res.body.success) {
                user._id = res.body.data.user._id;
            }
            done(err, res);
        });
    },

    registerExampleUsers: function (users, done) {
        var count = users.length;
        for (var user in users) {
            this.registerExampleUser(users[user], function (err, res) {
                if (err) {
                    return done(err, res);
                }
                --count || done();
            });
        }
    },

    registerExampleUserWithCredentials: function (credentials, done) {
        var result = api.post('/register');
        result.send(credentials);
        result.end(function (err, res) {
            if (res.body.success) {
                user._id = res.body.data.user._id;
            }
            done(err, res);
        });
    },

    postExampleMovie: function (user, movie, done) {
        var result = api.post('/movies');
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.send(movie);
        result.end(function (err, res) {
            if (res.body.success) {
                movie._id = res.body.data.movie._id;
            }
            done(err, res);
        });
    },

    postExampleMovies: function (usersAndMovie, done) {
        var values = usersAndMovie;
        var count = values.length;
        for (var key in values) {
            this.postExampleMovie(values[key].user, values[key].movie, function (err, res) {
                if (err) {
                    return done(err, res);
                }
                --count || done();
            });
        }
    },

    getExampleMovie: function (user, movieId, done) {
        var result = api.get('/movies/' + movieId);
        result.auth(user.username, user.password)
        result.end(function (err, res) {
            done(err, res);
        });
    },

    getExampleMovies: function (user, queryParams, done) {
        var result = api.get('/movies');
        result.query(queryParams);
        result.auth(user.username, user.password)
        result.end(function (err, res) {
            done(err, res);
        });
    },

    putExampleMovie: function (user, movieId, exampleMovie, done) {
        var result = api.put('/movies/' + movieId);
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.send(exampleMovie);
        result.end(function (err, res) {
            if (res.body.success) {
                exampleMovie._id = res.body.data.movie._id;
            }
            done(err, res);
        });
    },

    deleteExampleMovie: function (user, movieId, done) {
        var result = api.delete('/movies/' + movieId);
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.end(function (err, res) {
            done(err, res);
        });
    },

    getExampleMovieRating: function (user, movieId, done) {
        var result = api.get('/movies/' + movieId + '/rating');
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.end(function (err, res) {
            done(err, res);
        });
    },

    putExampleMovieRating: function (user, movieId, value, done) {
        var result = api.put('/movies/' + movieId + '/rating');
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.send({value: value});
        result.end(function (err, res) {
            done(err, res);
        });
    },

    getExampleMovieWatched: function (user, movieId, done) {
        var result = api.get('/movies/' + movieId + '/watched');
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.end(function (err, res) {
            done(err, res);
        });
    },

    putExampleMovieWatched: function (user, movieId, done) {
        var result = api.put('/movies/' + movieId + '/watched');
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.end(function (err, res) {
            done(err, res);
        });
    },

    setExampleMovieUnWatched: function (user, movieId, done) {
        var result = api.put('/movies/' + movieId + '/unwatched');
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.end(function (err, res) {
            done(err, res);
        });
    },

    getGenres: function (user, done) {
        var result = api.get('/movies/genres');
        result.auth(user.username, user.password)
        result.end(function (err, res) {
            done(err, res);
        });
    },

    getMovieProperty: function (propertyName, user, done) {
        var result = api.get('/movies/' + propertyName);
        result.auth(user.username, user.password)
        result.end(function (err, res) {
            done(err, res);
        });
    }

};
