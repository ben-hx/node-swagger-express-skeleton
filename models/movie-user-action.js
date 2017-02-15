var mongoose = require('mongoose');
var mongoosePlugins = require('../misc/mongoose-plugins');
var Movie = require("./movie");

var MovieUserActionSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
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

MovieUserActionSchema.plugin(mongoosePlugins.paginate);
MovieUserActionSchema.plugin(mongoosePlugins.toObjectTransformation);

MovieUserActionSchema.pre('save', function (done) {
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

module.exports = mongoose.model('MovieUserAction', MovieUserActionSchema);

