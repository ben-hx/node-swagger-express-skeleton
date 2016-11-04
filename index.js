'use strict';

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
    var port = config[app.settings.env].settings.port;
    http.createServer(app).listen(port, function () {
        console.log('App startet in %s-mode', app.settings.env);
        console.log('Your server is listening on port %d (http://localhost:%d)', port, port);
        console.log('Swagger-ui is available on http://localhost:%d/docs', port);
    });
}

module.exports = app; // for testing
