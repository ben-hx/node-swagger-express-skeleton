module.exports = {

    addToObjectToSchemaOptions: function (schema, transformCallback) {
        if (!schema.options.toObject) schema.options.toObject = {};
        schema.options.toObject.transform = function (doc, value, options) {
            delete value.__v;
            if (transformCallback) {
                transformCallback(doc, value, options);
            }
            return value;
        };
    }
};