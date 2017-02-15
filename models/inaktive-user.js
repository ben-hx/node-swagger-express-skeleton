var bcrypt = require('bcrypt-nodejs');
var validator = require('validator');
var mongoose = require('mongoose');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var InaktiveUserSchema = new mongoose.Schema({
    email: {
        unique: true,
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    }
});

InaktiveUserSchema.plugin(mongoosePlugins.created);
InaktiveUserSchema.plugin(mongoosePlugins.lastModified);
InaktiveUserSchema.plugin(mongoosePlugins.paginate);
InaktiveUserSchema.plugin(mongoosePlugins.toObjectTransformation, {
    transformCallback: function (doc, value, options) {
        delete value.password;
    }
});

/*
 Error Hook for Duplication
 */
InaktiveUserSchema.path('username').validate(function (value, done) {
    var id = this._id;
    var self = this;
    self.model('User').count({username: value, _id: {$ne: id}}, function (error, count) {
        if (error || count) {
            return done(false);
        }
        self.model('InaktiveUser').count({username: value, _id: {$ne: id}}, function (error, count) {

            done(!(error || count));
        });
    });
}, 'User with same username is already existing!');

InaktiveUserSchema.path('email').validate(function (value, done) {
    var id = this._id;
    var self = this;
    self.model('User').count({email: value, _id: {$ne: id}}, function (error, count) {
        if (error || count) {
            return done(false);
        }
        self.model('InaktiveUser').count({email: value, _id: {$ne: id}}, function (error, count) {
            done(!(error || count));
        });
    });
}, 'User with same email is already existing!');

InaktiveUserSchema.path('email').validate(function (value, done) {
    done(validator.isEmail(value));
}, 'Invalid email!');

InaktiveUserSchema.pre('save', function (done) {
    var user = this;
    if (!user.isModified('password')) {
        return done();
    }
    bcrypt.genSalt(5, function (err, salt) {
        if (err) {
            return done(err)
        }
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) {
                return done(err);
            }
            user.password = hash;
            done();
        });
    });
});

/*
 Added to the Prototype, because userModel.schema.methods
 is not working after schema has been constructed
 */
InaktiveUserSchema.methods.verifyPassword = function (password, done) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) {
            return done(err);
        }
        done(null, isMatch);
    });
};

module.exports = mongoose.model('InaktiveUser', InaktiveUserSchema);