'use strict';
var q = require('q');
var debug = require('debug')('app');
var express = require('express');
var passport = require('passport');
var cors = require('cors');
var bodyParser = require('body-parser');
var routes = require('./routes/routes');
var middlewares = require('./middlewares/middlewares');
var diContainer = require('./di-container/di-container')();
var config = diContainer.getConfig();

module.exports = function () {

    var app = express();

    return {
        addMiddleWares: function () {
            var deferred = q.defer();
            app.use(cors());
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(passport.initialize());
            app.use(middlewares.responseSendData());
            app.use(middlewares.addResourceOptionsToRequestObject());
            app.use(middlewares.addToRequestObject("diContainer", diContainer));
            app.use(config.settings.appBaseUrl, routes(express.Router(), diContainer));
            app.use(middlewares.errorResourceHandler());
            deferred.resolve();
            return deferred.promise;
        },
        startServer: function () {
            var deferred = q.defer();
            var settings = config.settings;
            var server = app.listen(settings.port, function (temp) {
                debug('%s startet in %s-mode', settings.appName, process.env.NODE_ENV);
                debug('%s is listening on port %d (%s:%d)', settings.appName, server.address().port, server.address().address, server.address().port);
                deferred.resolve(server);
            });
            return deferred.promise;
        },
        initialize: function () {
            return q.all([
                diContainer.initialize(),
                this.addMiddleWares(),
                this.startServer()
            ]).then(function (values) {
                return values[values.length - 1];
            });
        },
        getApp: function () {
            return app;
        }
    }
};

