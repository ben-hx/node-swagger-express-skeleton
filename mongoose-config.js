var q = require('q');
var mongoose = require('mongoose');

module.exports.initialize = function (app, config) {

    mongoose.Promise = q.Promise;

    var deferred = q.defer();

    mongoose.connect(config.db.mongoURI[app.settings.env], function(err, res) {
        if(err) {
            console.log('Error connecting to the database. ' + err);
            deferred.reject();
        } else {
            console.log('Connected to Database: ' + config.db.mongoURI[app.settings.env]);
            deferred.resolve();
        }
    });

    return deferred.promise;
}