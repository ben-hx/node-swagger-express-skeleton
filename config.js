var config = {};

config.production = {
    db: {
        //mongoURI: 'mongodb://benhx_mongoadmin:she8aiLoob@localhost:21409/trahsbay'
        mongoURI: 'mongodb://benhx_mongoadmin:she8aiLoob@localhost:21409/trashbay'
    },
    settings: {
        appName: "trashbay",
        appBaseUrl: '/v1',
        port: 62000,
        swagger: {
            ui: '/swagger.json'
        },
        movie: {
            moviesPerPageDefault: 10,
            moviesSortDefault: 'title'
        },
        user: {
            verification: {
                secret: 'mysupersecret',
                expiresIn: '6h',
            }
        }
    }
};

config.development = {
    db: {
        mongoURI: 'mongodb://localhost/development'
    },
    settings: {
        appName: "trashbay",
        appBaseUrl: '/v1',
        port: 8080,
        swagger: {
            ui: '/swagger.json'
        },
        movie: {
            moviesPerPageDefault: 10,
            moviesSortDefault: 'title'
        },
        user: {
            verification: {
                secret: 'mysupersecret',
                expiresIn: '6h',
            }
        }
    }
};

config.test = {
    db: {
        mongoURI: 'mongodb://localhost/test'
    },
    settings: {
        appName: "trashbay",
        appBaseUrl: '/v1',
        port: 9000,
        swagger: {
            ui: '/swagger.json'
        },
        movie: {
            moviesPerPageDefault: 10,
            moviesSortDefault: 'title'
        },
        user: {
            verification: {
                secret: 'mysupersecret',
                expiresIn: '6h',
            }
        }
    }
};

module.exports = config;