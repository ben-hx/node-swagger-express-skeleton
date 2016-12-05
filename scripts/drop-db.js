'use strict';
var config = require('../config');
var mongoose = require('mongoose');

process.env.NODE_ENV = 'test';

var con = mongoose.connect(config[process.env.NODE_ENV].db.mongoURI);
mongoose.connection.on('open', function () {
    con.connection.db.dropDatabase(function (err, result) {
        if (err) {
            console.log('Error droppint the database. ' + err);
            process.exit(1);
        } else {
            console.log('Database successfully dropped: ' + config[process.env.NODE_ENV].db.mongoURI);
            process.exit();
        }
    });
});


