var q = require('q');

var isConnected = false;

module.exports = function (mongooseConfig) {

    return {
        setUpDb: function () {
            var deferred = q.defer();
            if (!isConnected) {
                mongooseConfig.initialize().then(function () {
                    isConnected = true;
                    deferred.resolve(isConnected);
                }).catch(function (error) {
                    deferred.reject(error);
                });
            } else {
                deferred.resolve(isConnected);
            }
            return deferred.promise;
        },
        tearDownDb: function () {
            var deferred = q.defer();
            deferred.resolve();
            return deferred.promise;
        }
    }
};
