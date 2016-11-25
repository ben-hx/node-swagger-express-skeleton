var q = require('q');

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
        schema.add({lastModified: Date});

        schema.pre('save', function (next) {
            this.lastModified = new Date;
            next();
        });

        if (options && options.index) {
            schema.path('lastModified').index(options.index)
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
            self.find(query)
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