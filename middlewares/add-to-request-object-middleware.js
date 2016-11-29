'use strict';

module.exports = function (name, object) {

    function addToRequestObject(req, res, next) {
        req[name] = object;
        next();
    }

    return (addToRequestObject);
}
