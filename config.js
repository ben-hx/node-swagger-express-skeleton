var config = {};

config.db = {
    mongoURI: {
        production: 'mongodb://localhost/test-dev3',
        development: 'mongodb://localhost/test-dev3',
        test: 'mongodb://localhost/test-dev3'
    }
};

config.settings = {
    port: 8080,
    swagger: {
        ui: '/swagger.json'
    }
};

module.exports = config;