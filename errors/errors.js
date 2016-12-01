module.exports = {

    IllegalArgumentError: function (message) {
        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);
        this.name = 'IllegalArgumentExcpetion';
        this.message = message;
        this.status = 500;
    },

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

    ReadError: function (message) {
        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);
        this.name = 'ReadError';
        this.message = message || 'Error while reading from Database';
        this.status = 500;
    },

    WriteError: function (message) {
        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);
        this.name = 'ReadError';
        this.message = message || 'Error while writing to Database';
        this.status = 500;
    },

    ValidationError: function (data) {
        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);
        this.name = 'ValidationError';
        this.message = data.message || '';
        this.data = data;
        this.status = 400;
    },
    DuplicationError: function (data) {
        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);
        this.name = 'DuplicationError';
        this.message = data.message || '';
        this.data = data;
        this.status = 400;
    },
    UnexpectedError: function (error) {
        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);
        this.name = 'UnexpectedError';
        this.message = 'Do not know what happened';
        this.parentError = error;
        this.status = 500;
    },

    convertError: function (error) {
        if (error.name == 'CastError') {
            return new this.NotFoundError('Resource does not exist!');
        }
        else if (error.name == 'ValidationError' || error.code == 11000) {
            return new this.ValidationError(error);
        }
        else if (error.name == 'NotFoundError' || error.name == 'DuplicationError') {
            return error;
        }
        return new this.UnexpectedError(error);
    }
}