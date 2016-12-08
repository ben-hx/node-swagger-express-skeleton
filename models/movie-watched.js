var mongoose = require('mongoose');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var MovieWatchedSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {id: false});

MovieWatchedSchema.plugin(mongoosePlugins.lastModified, {fieldName: 'date'});
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

module.exports = mongoose.model('MovieWatched', MovieWatchedSchema);