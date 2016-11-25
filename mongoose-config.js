var q = require('q');
var mongoose = require('mongoose');

module.exports = function (debug, config) {
    return {
        initialize: function () {
            var deferred = q.defer();
            mongoose.Promise = q.Promise;
            mongoose.connect(config[process.env.NODE_ENV].db.mongoURI).then(function () {
                debug('Connected to Database: ' + config[process.env.NODE_ENV].db.mongoURI);
                deferred.resolve();
            }).catch(function (error) {
                debug('Error connecting to the database. ' + err);
                deferred.reject();
            });
            return deferred.promise;
        }
    }
};