'use strict';
var debug = require('debug')('app');
var app = require('express')();
var http = require('http');
var passport = require('passport');
var cors = require('cors');
var q = require('q');
var config = require('./config');
var errorMiddleware = require('./middlewares/error-middleware');
var mongooseConfig = require('./mongoose-config');
var swaggerToolsConfig = require('./swagger-tools-config');
var swaggerDoc = require('./definitions/swagger-doc');

app.use(cors());
swaggerToolsConfig.initialize(app, config, swaggerDoc.document)
    .then(function () {
        return mongooseConfig.initialize(config);
    })
    .then(function () {
        addMiddleware();
        startServer();
    });


function addMiddleware() {
    app.use(errorMiddleware.resourceErrorHandler);
    app.use(passport.initialize());
}

function startServer() {
    var port = config[process.env.NODE_ENV].settings.port;
    http.createServer(app).listen(port, function () {
        debug('App startet in %s-mode', process.env.NODE_ENV);
        debug('Your server is listening on port %d (http://localhost:%d)', port, port);
        debug('Swagger-ui is available on http://localhost:%d/docs', port);
    });
}

module.exports = app; // for testing
