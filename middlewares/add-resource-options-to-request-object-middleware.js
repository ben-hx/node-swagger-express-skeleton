'use strict';

module.exports = function (name, object) {

    function addToRequestObject(req, res, next) {
        req.resourceOptions = {
            query: req.query || {},
            sort: req.query.sort || '',
            page: req.query.page || 0,
            limit: req.query.limit || 0
        };
        delete req.resourceOptions.query.sort;
        delete req.resourceOptions.query.page;
        delete req.resourceOptions.query.limit;
        next();
    }

    return (addToRequestObject);
}
