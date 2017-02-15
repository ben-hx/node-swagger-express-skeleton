var bcrypt = require('bcrypt-nodejs');
var validator = require('validator');
var mongoose = require('mongoose');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    year: {
        type: Number,
        required: true
    },
    runtime: {
        type: String,
        required: true,
        trim: true
    },
    plot: {
        type: String,
        required: true
    },
    country: {
        type: String,
        trim: true
    },
    poster: {
        type: String
    },
    genres: [{
        type: String,
        required: true,
        trim: true
    }],
    directors: [{
        type: String,
        trim: true
    }],
    writers: [{
        type: String,
        trim: true
    }],
    actors: [{
        type: String,
        trim: true
    }],
    languages: [{
        type: String,
        required: true,
        trim: true
    }],
    lastModifiedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

MovieSchema.plugin(mongoosePlugins.created);
MovieSchema.plugin(mongoosePlugins.lastModified);
MovieSchema.plugin(mongoosePlugins.paginate);
MovieSchema.plugin(mongoosePlugins.toObjectTransformation);

module.exports = mongoose.model('Movie', MovieSchema);

