'use strict';
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('Repository-Util-Test', function () {

    var repositoryUtil = require("../../../../utils/repository-util")();

    beforeEach(function (done) {
        done();
    });

    afterEach(function (done) {
        done();
    });

    describe('removeUndefinedPropertiesOfObject()', function () {

        it('should return properties which are not undefined', function (done) {
            var obj = {
                property1: {},
                property2: "test",
                property3: [],
                property4: null,
                property5: undefined
            };
            var result = repositoryUtil.removeUndefinedPropertiesOfObject(obj);
            result.should.haveOwnProperty("property1");
            result.should.haveOwnProperty("property2");
            result.should.haveOwnProperty("property3");
            result.should.haveOwnProperty("property4");
            result.should.not.haveOwnProperty("property5");
            done();
        });

        it('should return properties which are not undefined recursive', function (done) {
            var obj = {
                recursive: {
                    property1: [],
                    property2: undefined
                }
            };
            var result = repositoryUtil.removeUndefinedPropertiesOfObject(obj);
            result.recursive.should.haveOwnProperty("property1");
            result.recursive.should.not.haveOwnProperty("property2");
            done();
        });

        it('should return undefined if undefined given', function (done) {
            var result = repositoryUtil.removeUndefinedPropertiesOfObject(undefined);
            expect(result).to.be.undefined;
            done();
        });

        it('should return null if null given', function (done) {
            var result = repositoryUtil.removeUndefinedPropertiesOfObject(null);
            expect(result).to.be.null;
            done();
        });

    });

    describe('removeEmptyObjectsOfArray()', function () {

        it('should return elements which are not empty', function (done) {
            var array = [
                "asdf",
                {property: {}},
                {},
                {property: undefined},
            ];
            var result = repositoryUtil.removeEmptyObjectsOfArray(array);
            result.length.should.equal(2);
            result[0].should.equal("asdf");
            result[1].should.haveOwnProperty("property");
            done();
        });

        it('should return empty array if empty array given', function (done) {
            var result = repositoryUtil.removeEmptyObjectsOfArray([]);
            result.should.be.empty;
            done();
        });

    });

    describe('castEmptyArrayToUndefined()', function () {

        it('should return undefined if array is empty', function (done) {
            var array = [];
            var result = repositoryUtil.castEmptyArrayToUndefined(array);
            expect(result).to.be.undefined;
            done();
        });

        it('should return array if given array is not empty', function (done) {
            var array = [
                "asdf"
            ];
            var result = repositoryUtil.removeEmptyObjectsOfArray(array);
            result.length.should.equal(1);
            result[0].should.equal("asdf");
            done();
        });

    });

});