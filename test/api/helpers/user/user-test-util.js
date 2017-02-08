module.exports = function (User, UserRepository) {
    return {
        saveExampleUser: function (data) {
            var user = new User(data);
            return user.save().then(function (user) {
                data._id = user._id;
            });
        },
        repositoryDecorator: {
            getActivatedUser: function (user) {
                self = this;
                return self.registerExampleUser(user).then(function () {
                    return self.activateExampleUser(user);
                });
            },

            getActivatedUserWithRole: function (user, role) {
                self = this;
                return self.getActivatedUser(user).then(function () {
                    return self.setRoleToExampleUser(user, role);
                });
            },

            registerExampleUser: function (user) {
                return UserRepository.register(user).then(function (resolvedUser) {
                    user._id = resolvedUser._id;
                    return resolvedUser;
                });
            },

            createExampleUser: function (user) {
                return UserRepository.create(user).then(function (resolvedUser) {
                    user._id = resolvedUser._id;
                    return resolvedUser;
                });
            },

            updateExampleUserById: function (id, data) {
                return UserRepository.updateById(id, data).then(function (resolvedUser) {
                    data._id = resolvedUser._id;
                    return resolvedUser;
                });
            },

            changeExampleUsersPasswordById: function (id, oldPassword, newPassword) {
                return UserRepository.changePasswordById(id, oldPassword, newPassword);
            },

            verifyExampleUsersPasswordById: function (id, password) {
                return UserRepository.verifyPasswordById(id, password);
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
                return UserRepository.activateById(user._id).then(function (resolvedUser) {
                    user._id = resolvedUser._id;
                    return resolvedUser;
                });
            },

            setRoleToExampleUser: function (user, role) {
                return UserRepository.setRoleById(user._id, role);
            },

            getInaktiveExampleUsers: function (options) {
                return UserRepository.getInaktiveUsers(options);
            },

            getExampleUsers: function (options) {
                return UserRepository.getUsers(options);
            },

            getExampleUser: function (user) {
                return UserRepository.getUserById(user._id);
            },
        }
    }
};
