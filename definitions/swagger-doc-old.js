module.exports.getSwaggerDoc = function getSwaggerDoc() {
    var resolve = require('json-refs').resolveRefs;
    var deferred = require('q').defer();

    var swaggerDocWithRefs = require('./swagger.json');

    resolve(swaggerDocWithRefs)
        .then(function (res) {
            deferred.resolve(res.resolved);

        }, function (err) {
            deferred.reject(error);
        });

    return deferred.promise;
}