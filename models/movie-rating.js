var mongoose = require('mongoose');
var errors = require('../errors/errors');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var MovieRatingSchema = new mongoose.Schema({
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

MovieRatingSchema.plugin(mongoosePlugins.lastModified, {fieldName: 'date'});
MovieRatingSchema.plugin(mongoosePlugins.paginate);
MovieRatingSchema.plugin(mongoosePlugins.toObjectTransformation);

MovieRatingSchema.path('user').validate(function (value, done) {
    this.model('User').count({_id: value}, function (error, count) {
        done(!(error || count == 0));
    });
}, 'User does not exist!');

module.exports = mongoose.model('MovieRating', MovieRatingSchema);