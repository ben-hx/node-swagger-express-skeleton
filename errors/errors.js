module.exports = {

    NotFoundError: function (message) {
        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);
        this.name = 'NotFoundError';
        this.message = message;
        this.status = 404;
    },

    AuthenticationError: function (message) {
        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);
        this.name = 'AuthenticationError';
        this.message = message;
        this.status = 401;
    },

    ValidationError: function (message) {
        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);
        this.name = 'ValidationError';
        this.message = message;
        this.status = 400;
    }

};