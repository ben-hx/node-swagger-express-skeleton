var bcrypt = require('bcrypt-nodejs');
var validator = require('validator');
var mongoose = require('mongoose');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    year: {
        type: Number,
        required: true
    },
    runtime: {
        type: String,
        required: true
    },
    plot: {
        type: String,
        required: true
    },
    country: {
        type: String
    },
    poster: {
        type: String
    },
    genres: [{
        type: String,
        required: true
    }],
    directors: [{
        type: String
    }],
    writers: [{
        type: String
    }],
    actors: [{
        type: String
    }],
    languages: [{
        type: String,
        required: true
    }],
    lastModifiedUser: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

MovieSchema.plugin(mongoosePlugins.lastModified);
MovieSchema.plugin(mongoosePlugins.paginate);
MovieSchema.plugin(mongoosePlugins.toObjectTransformation);

MovieSchema.pre('save', function (done) {
    var self = this;
    self.model('Movie').find().then(function (result) {
        //console.log(result);
        done();
    })
});


module.exports = mongoose.model('Movie', MovieSchema);

