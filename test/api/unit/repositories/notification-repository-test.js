'use strict';
var chai = require('chai');
var should = chai.should();
var sinon = require("sinon");
var q = require('q');
var mongoose = require("mongoose");

describe('Notification-Repository-CRUD-Tests', function () {

    var User = require("../../../../models/user");
    var Notification = require("../../../../models/notification");
    var testFactory = require("../../helpers/test-factory")();
    var exampleUsers = testFactory.exampleData.generateUsers();
    var dbTestUtil = testFactory.dbTestUtil();
    var userTestUtil = testFactory.userTestUtil();
    var notificationRepository = testFactory.notificationTestUtil().repository;
    var notificationTestUtil = testFactory.notificationTestUtil();
    var notificationEvaluation = testFactory.notificationEvaluation();
    var errorEvaluation = testFactory.errorEvaluation();

    before(dbTestUtil.setUpDb);
    after(dbTestUtil.tearDownDb);

    beforeEach(function (done) {
        notificationTestUtil.initTime();
        exampleUsers = testFactory.exampleData.generateUsers();
        q.all([
            User.remove(),
            Notification.remove(),
            userTestUtil.saveExampleUser(exampleUsers.bob),
            userTestUtil.saveExampleUser(exampleUsers.alice),
            userTestUtil.saveExampleUser(exampleUsers.eve),
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            User.remove(),
            Notification.remove(),
        ]).then(function () {
            done();
        });
    });

    describe('create()', function () {

        it('should return a notification when creating with valid data', function (done) {
            var data = {
                message: 'testMessage with ${testTemplate}',
                messageTemplates: {testTemplate: "testTemplate"},
                verb: 'testVerb'
            };
            notificationRepository.forUser(exampleUsers.bob).create(data).then(function (result) {
                notificationEvaluation.evaluateNotification(result, data);
                done();
            });
        });

        it('should return a notification when creating with minimal-data', function (done) {
            var data = {
                message: 'testMessage',
                verb: 'testVerb'
            };
            notificationRepository.forUser(exampleUsers.bob).create(data).then(function (result) {
                notificationEvaluation.evaluateMinimalNotification(result, data);
                done();
            });
        });

    });

    describe('getAll()', function () {

        var bobsNotifications;

        beforeEach(function (done) {
            notificationTestUtil.saveExampleNotificationArray(2, {
                createdUser: exampleUsers.bob
            }).then(function (result) {
                bobsNotifications = result;
                done();
            });
        });

        it('should return all notifications when getting all', function (done) {
            notificationRepository.forUser(exampleUsers.bob).getAll().then(function (result) {
                notificationEvaluation.evaluateNotificationArray(result.notifications, bobsNotifications);
                done();
            });
        });

    });

    describe('getById()', function () {

        var bobsNotification;

        beforeEach(function (done) {
            var data = {
                message: 'testMessage',
                verb: 'testVerb'
            };
            notificationRepository.forUser(exampleUsers.bob).create(data).then(function (result) {
                bobsNotification = result;
                done();
            });
        });

        it('should return a notification when getting by valid id', function (done) {
            notificationRepository.forUser(exampleUsers.bob).getById(bobsNotification._id).then(function (result) {
                notificationEvaluation.evaluateMinimalNotification(result, bobsNotification);
                done();
            });
        });

        it('should return a not-found-error when getting by invalid id', function (done) {
            notificationRepository.forUser(exampleUsers.bob).getById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

    describe('deleteById()', function () {

        var bobsNotification;

        beforeEach(function (done) {
            var data = {
                message: 'testMessage',
                verb: 'testVerb'
            };
            notificationRepository.forUser(exampleUsers.bob).create(data).then(function (result) {
                bobsNotification = result;
                done();
            });
        });

        it('should return a notification when deleting by valid id', function (done) {
            notificationRepository.forUser(exampleUsers.bob).deleteById(bobsNotification._id).then(function (result) {
                notificationEvaluation.evaluateMinimalNotification(result, bobsNotification);
                return notificationRepository.forUser(exampleUsers.bob).getById(bobsNotification._id);
            }).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

        it('should return a not-found-error when getting by invalid id', function (done) {
            notificationRepository.forUser(exampleUsers.bob).deleteById(new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca')).catch(function (error) {
                var excpectedError = {};
                errorEvaluation.evaluateNotFoundError(error, excpectedError);
                done();
            });
        });

    });

});