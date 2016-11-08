var q = require('q');
var mongoose = require('mongoose');
var debug = require('debug')('app');

module.exports.initialize = function (app, config) {

    mongoose.Promise = q.Promise;

    var deferred = q.defer();

    mongoose.connect(config[app.get('env')].db.mongoURI, function (err, res) {
        if (err) {
            debug('Error connecting to the database. ' + err);
            deferred.reject();
        } else {
            debug('Connected to Database: ' + config[app.get('env')].db.mongoURI);
            deferred.resolve();
        }
    });

    return deferred.promise;
}