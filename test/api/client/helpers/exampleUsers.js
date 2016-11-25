var defaultRole = 'looser';

module.exports = {
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
};