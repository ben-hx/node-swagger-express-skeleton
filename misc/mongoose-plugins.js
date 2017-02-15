var q = require('q');
var deepPopulate = require('mongoose-deep-populate');

module.exports = {

    toObjectTransformation: function (schema, options) {
        if (!schema.options.toObject) schema.options.toObject = {};
        schema.options.toObject.transform = function (doc, value, transformOptions) {
            delete value.__v;
            if (options && options.transformCallback) {
                options.transformCallback(doc, value, options);
            }
            return value;
        };
    },

    lastModified: function (schema, options) {
        var fieldName = 'lastModified';
        if (options && options.fieldName) {
            fieldName = options.fieldName;
        }
        var field = {}
        field[fieldName] = Date;
        schema.add(field);

        schema.pre('save', function (next) {
            this[fieldName] = new Date;
            next();
        });

        if (options && options.index) {
            schema.path(fieldName).index(options.index)
        }
    },

    created: function (schema, options) {
        var fieldName = 'created';
        if (options && options.fieldName) {
            fieldName = options.fieldName;
        }
        var field = {};
        field[fieldName] = Date;
        schema.add(field);

        schema.pre('save', function (next) {
            if (this.isNew) {
                this[fieldName] = new Date;
            }
            next();
        });

        if (options && options.index) {
            schema.path(fieldName).index(options.index)
        }
    },

    paginate: function (schema, options) {
        schema.statics.paginate = function (options) {
            var deferred = q.defer();
            var self = this;
            options = options || {};
            var query = options.query || {};
            var sort = options.sort || '';
            var limit = options.limit || 0;
            var page = options.page || 0;
            var populate = options.populate || '';
            self.find(query)
                .populate(populate)
                .skip(page * limit)
                .limit(limit)
                .sort(sort)
                .exec().then(function (docs) {
                return self.count(query).then(function (totalCount) {
                    return {totalCount: totalCount, docs: docs};
                });
            }).then(function (data) {
                var pagination = {
                    page: page,
                    limit: limit,
                    totalCount: data.totalCount,
                    totalPages: (limit == 0 ? 1 : Math.ceil(data.totalCount / limit))
                };
                deferred.resolve({docs: data.docs, pagination: pagination});
            }).catch(function (error) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
    },

};