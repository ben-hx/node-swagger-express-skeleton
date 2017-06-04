var validator = require('validator');
var mongoose = require('mongoose');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var NotificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        index: true
    },
    messageTemplates: {
        type: mongoose.Schema.Types.Mixed
    },
    verb: {
        type: String,
        required: true,
        index: true
    },
    read: {
        type: Boolean,
        required: true,
        index: true,
        default: false
    },
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

NotificationSchema.plugin(mongoosePlugins.created, {fieldName: 'date'});
NotificationSchema.plugin(mongoosePlugins.paginate);
NotificationSchema.plugin(mongoosePlugins.toObjectTransformation);

module.exports = mongoose.model('Notification', NotificationSchema);