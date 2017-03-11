var q = require('q');
var mongoose = require('mongoose');

module.exports = function (debug, config) {
    return {
        initialize: function () {
            var deferred = q.defer();
            if (mongoose.connection.readyState === 1) {
                deferred.resolve(mongoose.connection);
            } else {
                //mongoose.Promise = require('q').Promise;
                var connection = mongoose.connect(config.db.mongoURI, {auth: {authdb: "admin"}}).then(function () {
                    debug('Connected to Database: ' + config.db.mongoURI);
                    deferred.resolve(connection);
                }).catch(function (error) {
                    debug('Error connecting to the database. ' + error);
                    deferred.reject();
                });
            }
            return deferred.promise;
        }
    }
};