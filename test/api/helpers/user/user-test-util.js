module.exports = function (User) {
    return {
        saveExampleUser: function (data) {
            var user = new User(data);
            return user.save().then(function (user) {
                data._id = user._id;
            });
        }
    }
};
