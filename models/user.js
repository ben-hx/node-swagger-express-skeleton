var q = require('q');
var bcrypt = require('bcrypt-nodejs');
var validator = require('validator');
var mongoose = require('mongoose');
var mongoosePlugins = require('./../misc/mongoose-plugins');

var UserSchema = new mongoose.Schema({
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
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'looser']
    },
});

UserSchema.plugin(mongoosePlugins.created);
UserSchema.plugin(mongoosePlugins.lastModified);
UserSchema.plugin(mongoosePlugins.paginate);
UserSchema.plugin(mongoosePlugins.toObjectTransformation, {
    transformCallback: function (doc, value, options) {

        var selfPassword = value.password;

        delete value.password;

        value.verifyPassword = function (password) {
            var deferred = q.defer();
            bcrypt.compare(password, selfPassword, function (err, isMatch) {
                if (err) {
                    deferred.reject(err);
                }
                deferred.resolve(isMatch);
            });
            return deferred.promise;
        };

    }
});

/*
 Error Hook for Duplication
 */
UserSchema.path('username').validate(function (value, done) {
    var id = this._id;
    mongoose.model('User').count({username: value, _id: {$ne: id}}, function (error, count) {
        if (error || count) {
            return done(false);
        }
        mongoose.model('InaktiveUser').count({username: value, _id: {$ne: id}}, function (error, count) {
            done(!(error || count));
        });
    });
}, 'User with same username is already existing!');

UserSchema.path('email').validate(function (value, done) {
    var id = this._id;
    mongoose.model('User').count({email: value, _id: {$ne: id}}, function (error, count) {
        if (error || count) {
            return done(false);
        }
        mongoose.model('InaktiveUser').count({email: value, _id: {$ne: id}}, function (error, count) {
            done(!(error || count));
        });
    });
}, 'User with same email is already existing!');

UserSchema.path('email').validate(function (value, done) {
    done(validator.isEmail(value));
}, 'Invalid email!');

UserSchema.pre('save', function (done) {
    var user = this;
    if (!user.role) {
        user.role = 'looser';
    }
    done();
});

function hasPassword(user, done) {
    if (!user.isModified('password')) {
        return done();
    }
    bcrypt.genSalt(5, function (err, salt) {
        if (err) {
            return done(err)
        }
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) {
                return callback(err);
            }
            user.password = hash;
            done();
        });
    });
}

UserSchema.methods.saveWithHashedPassword = function () {
    var user = this;
    var deferred = q.defer();
    hasPassword(user, function (err) {
        if (err) {
            deferred.reject(err);
        }
        user.save().then(function (result) {
            deferred.resolve(result);
        }).catch(function (error) {
            deferred.reject(error);
        });
    });
    return deferred.promise;
};

/*
 Added to the Prototype, because userModel.schema.methods
 is not working after schema has been constructed
 */
UserSchema.methods.verifyPassword = function (password) {
    var deferred = q.defer();
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(isMatch);
    });
    return deferred.promise;
};

module.exports = mongoose.model('User', UserSchema);