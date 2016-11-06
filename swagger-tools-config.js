var swaggerTools = require('swagger-tools');
var q = require('q');
var authenticationService = require('./authentication/authentication-service');

module.exports.initialize = function (app, config, swaggerDoc) {

    var deferred = q.defer();

    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(middleware.swaggerMetadata());

        // Validate Swagger requests
        app.use(middleware.swaggerValidator({
            validateResponse: false
        }));

        app.use(middleware.swaggerSecurity(authenticationService.getOptions()));

        // swaggerRouter configuration
        var options = {
            swaggerUi: config[process.env.NODE_ENV].settings.swagger.ui,
            controllers: './controllers',
            useStubs: process.env.NODE_ENV === 'development' ? true : false
        };
        // Route validated requests to appropriate controller
        app.use(middleware.swaggerRouter(options));

        // Serve the Swagger documents and Swagger UI
        app.use(middleware.swaggerUi());

        deferred.resolve();
    });

    return deferred.promise;
};