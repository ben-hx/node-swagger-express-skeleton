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

    evaluateErrorResponse: function (response, statusCode) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(false);
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

    getExampleMovieWatched: function (user, movieId, done) {
        var result = api.get('/movies/' + movieId + '/watched');
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.end(function (err, res) {
            done(err, res);
        });
    },

    setExampleMovieWatched: function (user, movieId, done) {
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
    }

};
