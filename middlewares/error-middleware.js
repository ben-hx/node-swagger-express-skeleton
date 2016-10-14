// Middleware for all resource-errors
module.exports.resourceErrorHandler = function (err, req, res, next) {
    if (!err) {
        next();
        return;
    }
    var statusCode = err.status || 500;
    var message = "Unexpeced Error";
    if (err.name == 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error!'
    }
    if (err.failedValidation) {
        statusCode = 400;
        err = err.results;
        message = 'Validation Error!'
    }
    err.status = statusCode;
    res.status(statusCode);
    res.send({success: false, message: message, error: err});
}