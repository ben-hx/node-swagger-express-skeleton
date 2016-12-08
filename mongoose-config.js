var q = require('q');
var mongoose = require('mongoose');

module.exports = function (debug, config) {
    return {
        initialize: function () {
            var deferred = q.defer();
            mongoose.Promise = q.Promise;
            if (mongoose.connection.readyState === 1) {
                deferred.resolve(mongoose.connection);
            } else {
                var connection = mongoose.connect(config.db.mongoURI).then(function () {
                    debug('Connected to Database: ' + config.db.mongoURI);
                    deferred.resolve(connection);
                }).catch(function (error) {
                    debug('Error connecting to the database. ' + err);
                    deferred.reject();
                });
            }
            return deferred.promise;
        }
    }
};