'use strict';

module.exports = {
    errorResourceHandler: require('./error-resource-handler-middleware'),
    addResourceOptionsToRequestObject:  require('./add-resource-options-to-request-object-middleware'),
    addToRequestObject: require('./add-to-request-object-middleware'),
    responseSendData: require('./response-send-data'),
};
