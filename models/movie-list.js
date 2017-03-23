var validator = require('validator');
var mongoose = require('mongoose');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var MovieListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: {unique: true}
    },
    description: {
        type: String,
        required: true,
        index: true
    },
    movies: [{
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }
    }],
    access: {
        type: String,
        enum: ['public', 'private', 'group'],
        default: 'private'
    },
    editableUsers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readOnly: {
            type: Boolean,
            default: true
        }
    }],
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
    }],
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

MovieListSchema.pre('save', function (done) {
    var self = this;
    if (self.access == 'private') {
        self.editableUsers = [];
    }
    done();
});

MovieListSchema.plugin(mongoosePlugins.created);
MovieListSchema.plugin(mongoosePlugins.paginate);
MovieListSchema.plugin(mongoosePlugins.toObjectTransformation);

module.exports = mongoose.model('MovieList', MovieListSchema);

