var deref = require('json-schema-deref-sync');

var swaggerDocWithRefs = require('./swagger.json');

module.exports.document = deref(swaggerDocWithRefs);