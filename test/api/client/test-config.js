process.env.NODE_ENV = 'test';
var server = require('../../../index');
var config = require('../../../config');

module.exports = {

    apiVersion: 'v1',
    apiURI: 'http://localhost:'+config.test.settings.port+'/v1',

    responseOkSchema: {
        "success": "boolean",
        "message": "string",
        "data": "object"
    },

    responseErrorSchema: {
        "success": "booleang",
        "message": "string",
        "error": "object"
    }

};