var validator = require('validator');
var mongoose = require('mongoose');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var ObjectObserverSchema = new mongoose.Schema({
    object: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

NotificationSchema.plugin(mongoosePlugins.created);
NotificationSchema.plugin(mongoosePlugins.paginate);
NotificationSchema.plugin(mongoosePlugins.toObjectTransformation);

module.exports = mongoose.model('DomainObserver', ObjectObserverSchema);