var q = require('q');
var mongoose = require('mongoose');

module.exports.initialize = function (app, config) {

    mongoose.Promise = q.Promise;

    var deferred = q.defer();

    mongoose.connect(config[app.settings.env].db.mongoURI, function (err, res) {
        if (err) {
            console.log('Error connecting to the database. ' + err);
            deferred.reject();
        } else {
            //console.log('Connected to Database: ' + config.db.mongoURI[app.settings.env]);
            console.log('Connected to Database: ' + config[app.settings.env].db.mongoURI);
            deferred.resolve();
        }
    });

    return deferred.promise;
}