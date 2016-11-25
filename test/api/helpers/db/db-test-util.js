var debug = require('debug')('test');
var config = require('../../../../config');
var mongooseConfig = require('../../../../mongoose-config')(debug, config);

var isConnected = false;

module.exports = function () {

    return {
        setUpDb: function (done) {
            if (!isConnected) {
                mongooseConfig.initialize().then(function () {
                    isConnected = true;
                    done();
                });
            } else {
                done();
            }
        },
        tearDownDb: function (done) {
            return done();
        }
    }
};
