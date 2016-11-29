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
            deferred.resolve();
            return deferred.promise;
        },
        apiAgent: function () {
            /*
             if (!app) {
             throw Error('You have to call setUpServer before getting the agent');
             }
             return chai.request.agent(app);
             */
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
            }
        }
    }
};
