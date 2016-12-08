var mongoose = require('mongoose');
var mongoosePlugins = require('../misc/mongoose-plugins');

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
    }]
});

MovieUserActionSchema.plugin(mongoosePlugins.paginate);
MovieUserActionSchema.plugin(mongoosePlugins.toObjectTransformation);

module.exports = mongoose.model('MovieUserAction', MovieUserActionSchema);

