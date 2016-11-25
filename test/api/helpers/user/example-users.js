var defaultRole = 'looser';

module.exports.generate = function () {
    return {
        bob: {
            username: 'bob',
            email: 'bob@test.de',
            password: 'bob',
            role: defaultRole
        },

        adminBob: {
            username: 'bob',
            email: 'bob@test.de',
            password: 'bob',
            role: 'admin'
        },

        alice: {
            username: 'alice',
            email: 'alice@test.de',
            password: 'alice',
            role: defaultRole
        },

        eve: {
            username: 'eve',
            email: 'eve@test.de',
            password: 'eve',
            role: defaultRole
        },

        unpostedUser: {
            username: 'unpostedUser',
            email: 'unposted@test.de',
            password: 'unpostedUser',
            role: defaultRole,
        },

        minimal: {
            email: 'minimal@test.de',
            password: 'minimal',
            role: defaultRole
        },

        getArrayOfExampleUsers: function (count) {
            result = [];
            for (i = 0; i < count; i++) {
                var element = {
                    username: i + 'name',
                    email: i + '@test.de',
                    password: i + 'defaultPassword',
                    role: defaultRole
                };
                result.push(element);
            }
            return result;
        }
    }
};