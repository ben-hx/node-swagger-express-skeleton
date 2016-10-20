var chai = require('chai');
var supertest = require('supertest');
var should = chai.should();
var expect = chai.expect;
var testConfig = require('../test-config');
var api = supertest.agent(testConfig.apiURI);


module.exports = {

    exampleUsers: {
        bob: {
            username: 'bob',
            password: 'bob'
        },

        alice: {
            username: 'alice',
            password: 'alice'
        },

        unpostedUser: {
            username: 'unpostedUser',
            password: 'unpostedUser'
        }
    },

    exampleMovies: {
        theToxicAvenger: {
            title: 'The Toxic Avenger',
            year: '1984',
            runtime: '82 min',
            genre: 'Action, Comedy, Horror',
            director: 'Michael Herz, Lloyd Kaufman',
            writer: 'Lloyd Kaufman (story), Joe Ritter (screenplay), Lloyd Kaufman (additional material), Gay Partington Terry (additional material), Stuart Strutin (additional material)',
            actors: 'Andree Maranda, Mitch Cohen, Jennifer Babtist, Cindy Manion',
            plot: 'Tromaville has a monstrous new hero. The Toxic Avenger is born when meek mop boy Melvin falls into a vat of toxic waste. Now evildoers will have a lot to lose.',
            language: 'English',
            country: 'USA',
            poster: 'http://ia.media-imdb.com/images/M/MV5BNzViNmQ5MTYtMmI4Yy00N2Y2LTg4NWUtYWU3MThkMTVjNjk3XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg'
        },
        theToxicAvengerUpdated: {
            title: 'The Toxic Avenger!',
            year: '1983',
            runtime: '84 min',
            genre: 'Comedy, Horror',
            director: 'Michael Herz, Lloyd Kaufmän',
            writer: 'Lloyd Kaufman (story), Joe Ritter (screenplay), Lloyd Kaufman (additional material), Gay Partington Terry (additional material), Stuart Strutin',
            actors: 'Andree Maranda, Mitch Cohen, Jennifer Babtist',
            plot: 'Tromaville has a monstrous new hero. The Toxic Avenger is born when meek mop boy Melvin falls into a vat of toxic waste. Now evildoers will have a lot to lose!',
            language: 'English German',
            country: 'USA Usa',
            poster: 'http://ia.media-imdb.com/images/M/MV5BNzViNmQ5MTYtMmI4Yy00N2Y2LTg4NWUtYWU3MThkMTVjNjk3XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX301.jpg'
        },
        theToxicAvengerMinimal: {
            title: 'The Toxic Avenger',
            year: '1984',
            runtime: '82 min',
            genre: 'Action, Comedy, Horror',
            plot: 'Tromaville has a monstrous new hero. The Toxic Avenger is born when meek mop boy Melvin falls into a vat of toxic waste. Now evildoers will have a lot to lose.',
            language: 'English',
            poster: 'http://ia.media-imdb.com/images/M/MV5BNzViNmQ5MTYtMmI4Yy00N2Y2LTg4NWUtYWU3MThkMTVjNjk3XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg'
        },
        theToxicAvengerInvalid: {
            title: 'The Toxic Avenger',
            runtime: '82 min',
            genre: 'Action, Comedy, Horror',
            plot: 'Tromaville has a monstrous new hero. The Toxic Avenger is born when meek mop boy Melvin falls into a vat of toxic waste. Now evildoers will have a lot to lose.',
            language: 'English',
            poster: 'http://ia.media-imdb.com/images/M/MV5BNzViNmQ5MTYtMmI4Yy00N2Y2LTg4NWUtYWU3MThkMTVjNjk3XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg'
        }
    },

    evaluateSuccessfulUserResponse: function (response, statusCode, user) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(true);
        response.body.data.username.should.equal(user.username);
    },

    evaluateSuccessfulMovieResponse: function (response, statusCode, movie) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(true);
        response.body.data.title.should.equal(movie.title);
        delete response.body.data._id;
        response.body.data.should.deep.equal(movie);
    },

    evaluateSuccessfulMoviesResponse: function (response, statusCode, movies) {
        response.status.should.equal(statusCode);
        response.body.success.should.equal(true);

        for (var i in response.body.data) {
            value = response.body.data[i];
            delete value._id
        }
        response.body.data.should.deep.include.members(movies)
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
            done(err, res);
        });
    },

    registerExampleUserWithCredentials: function (credentials, done) {
        var result = api.post('/register');
        result.send(credentials);
        result.end(function (err, res) {
            done(err, res);
        });
    },

    postExampleMovie: function (user, movie, done) {
        var result = api.post('/movies');
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.send(movie);
        result.end(function (err, res) {
            done(err, res);
        });
    },

    getExampleMovie: function (user, id, done) {
        var result = api.get('/movies/' + id);
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

    putExampleMovie: function (user, id, movie, done) {
        var result = api.put('/movies/' + id);
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.send(movie);
        result.end(function (err, res) {
            done(err, res);
        });
    },

    deleteExampleMovie: function (user, id, done) {
        var result = api.delete('/movies/' + id);
        result.auth(user.username, user.password)
        result.set('Content-Type', 'application/json');
        result.end(function (err, res) {
            done(err, res);
        });
    }

};
