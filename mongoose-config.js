var q = require('q');
var mongoose = require('mongoose');
var debug = require('debug')('app');

module.exports.initialize = function (config) {

    mongoose.Promise = q.Promise;

    var deferred = q.defer();

    mongoose.connect(config[process.env.NODE_ENV].db.mongoURI, function (err, res) {
        if (err) {
            debug('Error connecting to the database. ' + err);
            deferred.reject();
        } else {
            debug('Connected to Database: ' + config[process.env.NODE_ENV].db.mongoURI);
            deferred.resolve();
        }
    });

    return deferred.promise;
}