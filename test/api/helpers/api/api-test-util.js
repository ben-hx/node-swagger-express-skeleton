var q = require('q');

if (!global.Promise) {
    global.Promise = require('q');
}
var chai = require('chai');
chai.use(require('chai-http'));

module.exports = function (config, debug, server) {

    var app = null;
    var agent = chai.request.agent('http://localhost:' + config.test.settings.port + config.test.settings.appBaseUrl);

    function setBasicAuthenticationForRequest(request, user) {
        request.auth(user.email, user.password);
    }

    return {
        setUpServer: function () {
            return server.initialize().then(function (serverApp) {
                app = serverApp;
            });
        },
        tearDownServer: function () {
            var deferred = q.defer();
            if (app) {
                app.close();
            }
            deferred.resolve();
            return deferred.promise;
        },
        apiAgent: function () {
            return agent;
        },
        apiDecorator: {
            register: function (user) {
                var deferred = q.defer();
                var result = agent.post('/register');
                result.set('Content-Type', 'application/json');
                result.send(user);
                result.then(function (res) {
                    if (res.body.success) {
                        user._id = res.body.data.user._id;
                    }
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            activate: function (user, inaktiveUserId) {
                var deferred = q.defer();
                var result = agent.post('/users/' + inaktiveUserId + '/activate');
                result.set('Content-Type', 'application/json');
                setBasicAuthenticationForRequest(result, user);
                result.then(function (res) {
                    if (res.body.success) {
                        user._id = res.body.data.user._id;
                    }
                    deferred.resolve(res)
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response)
                });
                return deferred.promise;
            },
            setRole: function (user, inaktiveUserId, roleName) {
                var deferred = q.defer();
                var result = agent.post('/users/' + inaktiveUserId + '/role/' + roleName);
                result.set('Content-Type', 'application/json');
                setBasicAuthenticationForRequest(result, user);
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            getMe: function (user) {
                var deferred = q.defer();
                var result = agent.get('/me');
                result.set('Content-Type', 'application/json');
                setBasicAuthenticationForRequest(result, user);
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            getUsers: function (user, queryParams) {
                var deferred = q.defer();
                var result = agent.get('/users');
                result.set('Content-Type', 'application/json');
                result.query(queryParams || {});
                setBasicAuthenticationForRequest(result, user);
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            getInaktiveUsers: function (user, queryParams) {
                var deferred = q.defer();
                var result = agent.get('/inaktive_users');
                result.set('Content-Type', 'application/json');
                result.query(queryParams || {});
                setBasicAuthenticationForRequest(result, user);
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            postMovie: function (user, movie) {
                var deferred = q.defer();
                var result = agent.post('/movies');
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.send(movie);
                result.then(function (res) {
                    if (res.body.success) {
                        movie._id = res.body.data.movie._id;
                    }
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            getMovies: function (user, queryParams) {
                var deferred = q.defer();
                var result = agent.get('/movies');
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.query(queryParams);
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            getMovie: function (user, movieId) {
                var deferred = q.defer();
                var result = agent.get('/movies/' + movieId);
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            putMovie: function (user, movieId, movieData) {
                var deferred = q.defer();
                var result = agent.put('/movies/' + movieId);
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.send(movieData);
                result.then(function (res) {
                    if (res.body.success) {
                        movieData._id = res.body.data.movie._id;
                    }
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            deleteMovie: function (user, movieId, movieData) {
                var deferred = q.defer();
                var result = agent.delete('/movies/' + movieId);
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            putMovieWatched: function (user, movieId) {
                var deferred = q.defer();
                var result = agent.put('/movies/' + movieId + '/watched');
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            putMovieUnwatched: function (user, movieId) {
                var deferred = q.defer();
                var result = agent.put('/movies/' + movieId + '/unwatched');
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            getMovieWatched: function (user, movieId) {
                var deferred = q.defer();
                var result = agent.get('/movies/' + movieId + '/watched');
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            putMovieRating: function (user, movieId, value) {
                var deferred = q.defer();
                var result = agent.put('/movies/' + movieId + '/rating');
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.send({value: value});
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            deleteMovieRating: function (user, movieId) {
                var deferred = q.defer();
                var result = agent.delete('/movies/' + movieId + '/rating');
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
            getMovieRating: function (user, movieId) {
                var deferred = q.defer();
                var result = agent.get('/movies/' + movieId + '/rating');
                setBasicAuthenticationForRequest(result, user);
                result.set('Content-Type', 'application/json');
                result.then(function (res) {
                    deferred.resolve(res);
                });
                result.catch(function (error) {
                    debug(error);
                    deferred.resolve(error.response);
                });
                return deferred.promise;
            },
        }
    }
};
