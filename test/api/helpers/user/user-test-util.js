module.exports = function (User, UserRepository) {
    return {
        saveExampleUser: function (data) {
            var user = new User(data);
            return user.save().then(function (user) {
                data._id = user._id;
            });
        },
        repositoryDecorator: {
            registerExampleUser: function (user) {
                return UserRepository.register(user).then(function (resolvedUser) {
                    user._id = resolvedUser._id;
                    return resolvedUser;
                });
            },

            registerExampleUsers: function (users) {
                var promises = [];
                var self = this;
                users.forEach(function (user) {
                    promises.push(self.registerExampleUser(user));
                });
                return q.all(promises);
            },

            activateExampleUser: function (user) {
                return UserRepository.activate(user).then(function (resolvedUser) {
                    user._id = resolvedUser._id;
                    return resolvedUser;
                });
            },

            setRoleToExampleUser: function (user, role) {
                return UserRepository.setRole(user, role);
            },

            getInaktiveExampleUsers: function (options) {
                return UserRepository.getInaktiveUsers(options);
            },

            getExampleUsers: function (options) {
                return UserRepository.getUsers(options);
            }
        }
    }
};