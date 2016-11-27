'use strict';
var chai = require('chai');
var should = chai.should();
var q = require('q');

describe('Pagination-Tests', function () {

    var mongoose = require('mongoose');
    var mongoosePlugins = require('../../../../../misc/mongoose-plugins');
    var testFactory = require("../../../helpers/test-factory")();
    var dbTestUtil = testFactory.dbTestUtil();

    var TestModelSchema = new mongoose.Schema({
        name: String,
        date: Date
    });
    TestModelSchema.plugin(mongoosePlugins.paginate);
    var TestModel = mongoose.model('TestModel', TestModelSchema);

    function saveExampleTestData(count) {
        var promises = [];
        var date = new Date();
        for (var i = 0; i < count; i++) {
            var model = new TestModel({name: 'name' + i, date: new Date(date.getTime() + i)});
            promises.push(model.save());
        }
        return q.all(promises);
    }

    var maxRecordCount = 22;

    before(dbTestUtil.setUpDb);

    after(dbTestUtil.tearDownDb);

    beforeEach(function (done) {
        q.all([
            TestModel.remove(),
            saveExampleTestData(maxRecordCount)
        ]).then(function () {
            done();
        });
    });

    afterEach(function (done) {
        q.all([
            TestModel.remove()
        ]).then(function () {
            done();
        });
    });

    it('should return one record searched by query', function (done) {
        var options = {
            query: {name: 'name2'}
        };
        TestModel.paginate(options).then(function (result) {
            result.docs.should.have.length(1);
            result.docs[0].name.should.equal('name2');
            result.pagination.page.should.equal(0);
            result.pagination.limit.should.equal(0);
            result.pagination.totalCount.should.equal(1);
            result.pagination.totalPages.should.equal(1);
            done();
        });
    });

    it('should return all records searched by sort (name desc)', function (done) {
        var options = {
            sort: '-date'
        };
        TestModel.paginate(options).then(function (result) {
            result.docs.should.have.length(maxRecordCount);
            result.docs[0].name.should.equal('name' + (maxRecordCount - 1));
            result.docs[maxRecordCount - 1].name.should.equal('name0');
            result.pagination.page.should.equal(0);
            result.pagination.limit.should.equal(0);
            result.pagination.totalCount.should.equal(maxRecordCount);
            result.pagination.totalPages.should.equal(1);
            done();
        });
    });

    it('should return all records searched by page 0', function (done) {
        var options = {
            page: 0
        };
        TestModel.paginate(options).then(function (result) {
            result.docs.should.have.length(maxRecordCount);
            result.pagination.page.should.equal(0);
            result.pagination.limit.should.equal(0);
            result.pagination.totalCount.should.equal(maxRecordCount);
            result.pagination.totalPages.should.equal(1);
            done();
        });
    });

    it('should return 10 and page 0 records searched by limit 10', function (done) {
        var options = {
            limit: 10
        };
        TestModel.paginate(options).then(function (result) {
            result.docs.should.have.length(10);
            result.pagination.page.should.equal(0);
            result.pagination.limit.should.equal(10);
            result.pagination.totalCount.should.equal(maxRecordCount);
            result.pagination.totalPages.should.equal(3);
            done();
        });
    });

    it('should return 10 records searched by limit 10 and page 0', function (done) {
        var options = {
            limit: 10,
            page: 0
        };
        TestModel.paginate(options).then(function (result) {
            result.docs.should.have.length(10);
            result.pagination.page.should.equal(0);
            result.pagination.limit.should.equal(10);
            result.pagination.totalCount.should.equal(maxRecordCount);
            result.pagination.totalPages.should.equal(3);
            done();
        });
    });

    it('should return 10 records searched by limit 10 and page 1', function (done) {
        var options = {
            limit: 10,
            page: 1
        };
        TestModel.paginate(options).then(function (result) {
            result.docs.should.have.length(10);
            result.pagination.page.should.equal(1);
            result.pagination.limit.should.equal(10);
            result.pagination.totalCount.should.equal(maxRecordCount);
            result.pagination.totalPages.should.equal(3);
            done();
        });
    });

    it('should return 2 records searched by limit 10 and page 2', function (done) {
        var options = {
            limit: 10,
            page: 2
        };
        TestModel.paginate(options).then(function (result) {
            result.docs.should.have.length(2);
            result.pagination.page.should.equal(2);
            result.pagination.limit.should.equal(10);
            result.pagination.totalCount.should.equal(maxRecordCount);
            result.pagination.totalPages.should.equal(3);
            done();
        });
    });

    it('should return 0 records searched by pagination page 3 and limit 10', function (done) {
        var options = {
            limit: 10,
            page: 3
        };
        TestModel.paginate(options).then(function (result) {
            result.docs.should.have.length(0);
            result.pagination.page.should.equal(3);
            result.pagination.limit.should.equal(10);
            result.pagination.totalCount.should.equal(maxRecordCount);
            result.pagination.totalPages.should.equal(3);
            done();
        });
    });

    it('should return 2 records of 2 searched by limit 10 and page 0', function (done) {
        q.all([
            TestModel.remove(),
            (new TestModel({name: 'test1', date: new Date()})).save(),
            (new TestModel({name: 'test2', date: new Date()})).save(),
        ]).then(function () {
            var options = {
                limit: 10,
                page: 0
            };
            return TestModel.paginate(options);
        }).then(function (result) {
            result.docs.should.have.length(2);
            result.pagination.page.should.equal(0);
            result.pagination.limit.should.equal(10);
            result.pagination.totalCount.should.equal(2);
            result.pagination.totalPages.should.equal(1);
            done();
        });
    });

});