process.env.NODE_ENV = 'test';
var server = require('../../../index');

module.exports = {

    apiVersion: 'v1',
    apiURI: 'http://localhost:8080/v1',

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