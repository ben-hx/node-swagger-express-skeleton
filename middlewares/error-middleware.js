// Middleware for all resource-errors
module.exports.resourceErrorHandler = function (err, req, res, next) {
    if (!err) {
        return next();
    }
    //console.log(err);
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
    err.status = statusCode;
    res.status(statusCode);
    res.send({success: false, message: message, error: err});
};