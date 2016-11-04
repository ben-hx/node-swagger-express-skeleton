var config = {};

config.production = {
    db: {
        mongoURI: 'mongodb://localhost/production'
    },
    settings: {
        port: 8090,
        swagger: {
            ui: '/swagger.json'
        }
    }
};

config.development = {
    db: {
        mongoURI: 'mongodb://localhost/development'
    },
    settings: {
        port: 8080,
        swagger: {
            ui: '/swagger.json'
        }
    }
};

config.test = {
    db: {
        mongoURI: 'mongodb://localhost/test'
    },
    settings: {
        port: 9000,
        swagger: {
            ui: '/swagger.json'
        }
    }
};

config.db = {
    mongoURI: {
        production: 'mongodb://localhost/test-production',
        development: 'mongodb://localhost/test-development',
        test: 'mongodb://localhost/test-test'
    }
};

config.settings = {
    port: 8080,
    swagger: {
        ui: '/swagger.json'
    }
};

module.exports = config;