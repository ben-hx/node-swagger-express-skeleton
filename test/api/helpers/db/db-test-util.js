var q = require('q');

var isConnected = false;

module.exports = function (mongooseConfig) {

    return {
        setUpDb: function () {
            return mongooseConfig.initialize();
        },
        tearDownDb: function () {
            var deferred = q.defer();
            deferred.resolve();
            return deferred.promise;
        }
    }

};
