var config = {};

config.production = {
    db: {
        mongoURI: 'mongodb://localhost/production'
    },
    settings: {
        port: 8090,
        swagger: {
            ui: '/swagger.json'
        },
        movie: {
            moviesPerPageDefault: 10,
            moviesSortDefault: 'title'
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
        },
        movie: {
            moviesPerPageDefault: 10,
            moviesSortDefault: 'title'
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
        },
        movie: {
            moviesPerPageDefault: 10,
            moviesSortDefault: 'title'
        }
    }
};

module.exports = config;