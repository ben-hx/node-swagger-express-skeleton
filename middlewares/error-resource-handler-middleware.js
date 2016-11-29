'use strict';

var debug = require('debug')('app');

module.exports = function errorHandler(options) {

    function resourceErrorHandler(err, req, res, next) {
        if (!err) {
            return next();
        }
        var statusCode = err.status || 500;
        var message = "Unexpeced Error";
        if (err.name == 'ValidationError' || err.failedValidation) {
            statusCode = 400;
            err = err.results || err;
            message = 'Validation Error!'
        }
        if (err.name == 'AuthenticationError') {
            statusCode = 401;
            message = 'Authentication Error!'
        }
        if (statusCode == 500) {
            console.log(err);
            debug(err);
        }
        err.status = statusCode;
        res.status(statusCode);
        res.send({success: false, message: message, error: err});
    }

    return (resourceErrorHandler);
};
