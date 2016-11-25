'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('User-Repository-Tests', function () {

    process.env.NODE_ENV = 'test';
    var debug = require('debug')('test');
    var config = require('../../../config');
    var errors = require("../../../errors/errors");
    var mongoose = require('../../../mongoose-config')(debug, config);
    mongoose.initialize();
    var generateExampleUsers = require("../helpers/user/example-users").generate;
    var exampleUsers = generateExampleUsers();
    var User = require("../../../models/user");
    var InaktiveUser = require("../../../models/inaktive-user");
    var UserRepository = require("../../../repositories/user-repository")(config, errors, User, InaktiveUser);
    var testUtil = require('../helpers/test-util')(config, errors, UserRepository);

    beforeEach(function (done) {
        exampleUsers = generateExampleUsers();
        q.all([
            User.remove(),
            InaktiveUser.remove()
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            User.remove(),
            InaktiveUser.remove()
        ]).then(function () {
            done();
        });
    });

    after(function (done) {
        q.all([
            mongoose.connection.db.dropDatabase(),
            mongoose.disconnect(done)
        ]).then(function () {
            done();
        });
    });

    describe('tempTest', function () {

        it('bla', function (done) {
            testUtil.registerExampleUser(exampleUsers.alice).then(function (users) {
                return testUtil.getInaktiveExampleUsers();
            }).then(function (result) {
                done();
            }).catch(function (error) {
                console.log(error);
            }) ;
        });
    });


});