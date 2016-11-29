'use strict';

module.exports = function (name, object) {

    return function (req, res, next) {
        res.sendData = function (data, message) {
            var result = {
                success: true,
                data: data
            };
            if (message) {
                result.message = message;
            }
            res.send(result);
        }
        next();
    }
}
