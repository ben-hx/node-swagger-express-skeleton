var bcrypt = require('bcrypt-nodejs');
var validator = require('validator');
var userModel = require('./models').User;
var modelUtil = require('./model-util');

modelUtil.addToObjectToSchemaOptions(userModel.schema, function (doc, user, options) {
    delete user.password;
});

/*
 Error Hook for Duplication
 */
userModel.schema.path('username').validate(function (value, done) {
    var id = this._id;
    this.model('User').count({username: value, _id: {$ne: id}}, function (error, count) {
        done(!(error || count));
    });
}, 'User with same username is already existing!');

userModel.schema.path('email').validate(function (value, done) {
    var id = this._id;
    this.model('User').count({email: value, _id: {$ne: id}}, function (error, count) {
        done(!(error || count));
    });
}, 'User with same email is already existing!');

userModel.schema.path('email').validate(function (value, done) {
    done(validator.isEmail(value));
}, 'Invalid email!');

userModel.schema.pre('save', function (callback) {
    var user = this;

    if (!user.isModified('password')) {
        return callback();
    }

    bcrypt.genSalt(5, function (err, salt) {
        if (err) {
            return callback(err)
        }
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) {
                return callback(err);
            }
            user.password = hash;
            callback();
        });
    });
});

/*
 Added to the Prototype, because userModel.schema.methods
 is not working after schema has been constructed
 */
userModel.prototype['verifyPassword'] = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};

module.exports = userModel;