'use strict';

module.exports = function () {

    function isEmpty(obj) {
        if (obj == null) return true;
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        if (typeof obj !== "object") return true;

        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
        }
        return true;
    }

    return {
        removeUndefinedPropertiesOfObject: function (obj) {
            for (var propName in obj) {
                if (obj[propName] === undefined) {
                    delete obj[propName];
                } else if (typeof obj === 'object') {
                    this.removeUndefinedPropertiesOfObject(obj[propName]);
                }
            }
            return obj;
        },
        removeEmptyObjectsOfArray: function (arr) {
            var result = [];
            for (var key in arr) {
                var value = arr[key];
                if (typeof value === 'object') {
                    value = this.removeUndefinedPropertiesOfObject(arr[key]);
                    if (isEmpty(value)) {
                        value = undefined;
                    }
                }
                if (value != undefined) {
                    result.push(value);
                }
            }
            return result;
        },
        castEmptyArrayToUndefined: function (arr) {
            return arr.length > 0 ? arr : undefined;
        },
        castQueryParamToArray: function (param) {
            if (param) {
                return {"$in": [param]};
            }
            return undefined;
        },
        castQueryParamByOptionalArray: function (param) {
            if (param) {
                if (param instanceof Array) {
                    return {"$in": param};
                } else {
                    return param;
                }
            }
            return undefined;
        },
        castQueryParamByBeginning: function (param) {
            if (param) {
                return {"$regex": param, "$options": "i"};
            }
            return undefined;
        },
        castQueryParamByOptionalRange: function (from, to) {
            if (!from && !to) {
                return undefined;
            }
            var result = {};
            if (from) {
                result.$gte = from;
            }
            if (to) {
                result.$lte = to;
            }
            return result;
        },
        castQueryParamByOptionalDateRange: function (from, to) {
            if (!from && !to) {
                return undefined;
            }
            var result = {};
            if (from) {
                result.$gte = new Date(from);
            }
            if (to) {
                result.$lte = new Date(to);
            }
            return result;
        }

    }
};