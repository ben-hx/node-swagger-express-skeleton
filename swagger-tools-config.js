var swaggerTools = require('swagger-tools');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var q = require('q');
var User = require('./models/user');

passport.use(new BasicStrategy(
    function(username, password, callback) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return callback(err); }

            if (!user) { return callback(null, false); }

            user.verifyPassword(password, function(err, isMatch) {
                if (err) { return callback(err); }

                if (!isMatch) { return callback(null, false); }

                return callback(null, user);
            });
        });
    }
));

function AuthenticationError(message, status) {
    Error.call(this);
    Error.captureStackTrace(this, arguments.callee);
    this.name = 'AuthenticationError';
    this.message = message;
    this.status = status || 401;
}

module.exports.initialize = function (app, config, swaggerDoc) {

    var deferred = q.defer();

    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(middleware.swaggerMetadata());

        // Validate Swagger requests
        app.use(middleware.swaggerValidator({
            validateResponse: false
        }));

        app.use(middleware.swaggerSecurity({
            user_auth: function (req, authOrSecDef, scopesOrApiKey, callback) {

                passport.authenticate('basic', { session: false }, function (err, user, info) {
                    if(err) {
                        return callback(new AuthenticationError());
                    }
                    if(!user) {
                        return callback(new AuthenticationError());
                    }
                    req.user = user;
                    return callback();
                })(req, null, callback);
            }
        }));

        // swaggerRouter configuration
        var options = {
            swaggerUi: config[app.settings.env].settings.swagger.ui,
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
}