var validator = require('validator');
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    titleAlias: [{
        type: String,
        trim: true,
        index: true,
        unique: true
    }],
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
    tags: [{
        type: String,
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
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    watched: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        value: {
            type: Number,
            min: 0,
            max: 10
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },
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


MovieSchema.path('title').validate(function (value, done) {
    var id = this._id;

    mongoose.model('Movie').count({
        $and: [
            {$or: [{title: value}, {titleAlias: value}]},
            {_id: {$ne: id}}
        ]
    }, function (error, count) {
        return done(!(error || count));
    });
}, 'Movie with same title or alias is already existing!');

MovieSchema.path('titleAlias').validate(function (value, done) {
    var id = this._id;

    mongoose.model('Movie').count({
        $and: [
            {$or: [{title: {"$in": value}}, {titleAlias: {"$in": value}}]},
            {_id: {$ne: id}}
        ]
    }, function (error, count) {
        return done(!(error || count));
    });
}, 'Movie with same title or alias is already existing!');

MovieSchema.pre('save', function (done) {
    var self = this;
    self.averageRating = null;
    if (self.ratings.length > 0) {
        var totalRatings = 0;
        self.ratings.forEach(function (rating) {
            totalRatings += rating.value;
        });
        self.averageRating = totalRatings / self.ratings.length;
    }
    done();
});

MovieSchema.plugin(mongoosePlugins.created);
MovieSchema.plugin(mongoosePlugins.paginate);
MovieSchema.plugin(mongoosePlugins.toObjectTransformation);
MovieSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Movie', MovieSchema);

