var mongoose = require('mongoose');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var MovieWatchedSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

MovieWatchedSchema.plugin(mongoosePlugins.lastModified);
MovieWatchedSchema.plugin(mongoosePlugins.paginate);
MovieWatchedSchema.plugin(mongoosePlugins.toObjectTransformation, {
    transformCallback: function (doc, value, options) {
        value.watched = true;
    }
});

MovieWatchedSchema.path('user').validate(function (value, done) {
    this.model('User').count({_id: value}, function (error, count) {
        done(!(error || count == 0));
    });
}, 'User does not exist!');

MovieWatchedSchema.path('movie').validate(function (value, done) {
    this.model('Movie').count({_id: value}, function (error, count) {
        done(!(error || count == 0));
    });
}, 'Movie does not exist!');

module.exports = mongoose.model('MovieWatched', MovieWatchedSchema);