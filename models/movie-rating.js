var mongoose = require('mongoose');
var errors = require('../errors/errors');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var MovieRatingSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: Number,
        min: 0,
        max: 10,
        required: true
    }
});

MovieRatingSchema.plugin(mongoosePlugins.lastModified);
MovieRatingSchema.plugin(mongoosePlugins.paginate);
MovieRatingSchema.plugin(mongoosePlugins.toObjectTransformation);

MovieRatingSchema.path('user').validate(function (value, done) {
    this.model('User').count({_id: value}, function (error, count) {
        done(!(error || count == 0));
    });
}, 'User does not exist!');

MovieRatingSchema.path('movie').validate(function (value, done) {
    this.model('Movie').count({_id: value}, function (error, count) {
        done(!(error || count == 0));
    });
}, 'Movie does not exist!');

MovieRatingSchema.pre('save', function (done) {
    var data = {
        user: this.user,
        movie: this.movie
    };
    this.model('MovieWatched').count(data, function (error, count) {
        if (error || count == 0) {
            return done(new Error('Movie has to be watched before!'));
        }
        return done();
    });
});

module.exports = mongoose.model('MovieRating', MovieRatingSchema);