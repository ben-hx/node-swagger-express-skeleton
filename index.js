'use strict';

var app = require('express')();
var http = require('http');
var passport = require('passport');
var q = require('q');
var config = require('./config');
var errorMiddleware = require('./middlewares/error-middleware');

var mongooseConfig = require('./mongoose-config');
var swaggerToolsConfig = require('./swagger-tools-config');
var swaggerDoc = require('./definitions/swagger-doc');


swaggerToolsConfig.initialize(app, config, swaggerDoc.document)
    .then(function () {
        return mongooseConfig.initialize(app, config);
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
    http.createServer(app).listen(config.settings.port, function () {
        console.log('Your server is listening on port %d (http://localhost:%d)', config.settings.port, config.settings.port);
        console.log('Swagger-ui is available on http://localhost:%d/docs', config.settings.port);
    });
}

module.exports = app; // for testing
