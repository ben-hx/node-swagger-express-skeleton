var validator = require('validator');
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    text: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

PostSchema.plugin(mongoosePlugins.created);
PostSchema.plugin(mongoosePlugins.paginate);
PostSchema.plugin(mongoosePlugins.toObjectTransformation);
PostSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Post', PostSchema);

