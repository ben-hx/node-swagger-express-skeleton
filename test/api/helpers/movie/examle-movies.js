var bcrypt = require('bcrypt-nodejs');

module.exports.getMovieCreatedFromUser = function (movie, user) {
    movie.userCreated = user._id;
    return movie;
};

module.exports.generate = function () {

    return {
        theToxicAvenger: {
            title: 'The Toxic Avenger',
            titleAlias: ['Toxieee'],
            year: 1984,
            runtime: '82 min',
            genres: ['Comedy', 'Horror', 'Action'],
            tags: ['Troma', 'Hell Yeah'],
            directors: ['Michael Herz', 'Lloyd Kaufman'],
            writers: ['Lloyd Kaufman (story)', 'Joe Ritter (screenplay)', 'Gay Partington Terry (additional material)', 'Stuart Strutin (additional material)'],
            actors: ['Andree Maranda', 'Mitch Cohen', 'Jennifer Babtist', 'Cindy Manion'],
            plot: 'Tromaville has a monstrous new hero. The Toxic Avenger is born when meek mop boy Melvin falls into a vat of toxic waste. Now evildoers will have a lot to lose.',
            languages: ['English'],
            country: 'USA',
            poster: 'http://ia.media-imdb.com/images/M/MV5BNzViNmQ5MTYtMmI4Yy00N2Y2LTg4NWUtYWU3MThkMTVjNjk3XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg'
        },
        theToxicAvengerSame: {
            title: 'The Toxic Avenger',
            titleAlias: ['Toxieee'],
            year: 1984,
            runtime: '82 min',
            genres: ['Comedy', 'Horror', 'Action'],
            tags: ['Troma', 'Hell Yeah'],
            directors: ['Michael Herz', 'Lloyd Kaufman'],
            writers: ['Lloyd Kaufman (story)', 'Joe Ritter (screenplay)', 'Gay Partington Terry (additional material)', 'Stuart Strutin (additional material)'],
            actors: ['Andree Maranda', 'Mitch Cohen', 'Jennifer Babtist', 'Cindy Manion'],
            plot: 'Tromaville has a monstrous new hero. The Toxic Avenger is born when meek mop boy Melvin falls into a vat of toxic waste. Now evildoers will have a lot to lose.',
            languages: ['English'],
            country: 'USA',
            poster: 'http://ia.media-imdb.com/images/M/MV5BNzViNmQ5MTYtMmI4Yy00N2Y2LTg4NWUtYWU3MThkMTVjNjk3XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg'
        },
        theToxicAvengerUpdated: {
            title: 'The Toxic Avenger!',
            titleAlias: ['Toxie'],
            year: 1983,
            runtime: '84 min',
            genres: ['Comedy', 'Horror'],
            tags: ['Troma', 'Hell Yeah'],
            directors: ['Michael Herz', 'Lloyd Kaufman'],
            writers: ['Lloyd Kaufman (story)', 'Joe Ritter (screenplay)', 'Gay Partington Terry (additional material)', 'Stuart Strutin (additional material)'],
            actors: ['Andree Maranda', 'Sarah Bara, Musu Jogan'],
            plot: 'Tromaville has a monstrous new hero. The Toxic Avenger is born when meek mop boy Melvin falls into a vat of toxic waste. Now evildoers will have a lot to lose!',
            languages: ['English', 'German'],
            country: 'Germany',
            poster: 'http://ia.media-imdb.com/images/M/MV5BNzViNmQ5MTYtMmI4Yy00N2Y2LTg4NWUtYWU3MThkMTVjNjk3XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX301.jpg'
        },
        theToxicAvengerMinimal: {
            title: 'The Toxic Avenger',
            year: 1984,
            runtime: '82 min',
            genres: ['Comedy', 'Horror', 'Action'],
            tags: ['Troma', 'Hell Yeah'],
            directors: [],
            writers: [],
            actors: [],
            plot: 'Tromaville has a monstrous new hero. The Toxic Avenger is born when meek mop boy Melvin falls into a vat of toxic waste. Now evildoers will have a lot to lose.',
            languages: ['English'],
            poster: 'http://ia.media-imdb.com/images/M/MV5BNzViNmQ5MTYtMmI4Yy00N2Y2LTg4NWUtYWU3MThkMTVjNjk3XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg'
        },
        theToxicAvengerInvalid: {
            title: 'The Toxic Avenger',
            runtime: '82 min',
            genres: ['Comedy', 'Horror', 'Action'],
            plot: 'Tromaville has a monstrous new hero. The Toxic Avenger is born when meek mop boy Melvin falls into a vat of toxic waste. Now evildoers will have a lot to lose.',
            languages: ['English'],
            poster: 'http://ia.media-imdb.com/images/M/MV5BNzViNmQ5MTYtMmI4Yy00N2Y2LTg4NWUtYWU3MThkMTVjNjk3XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg'
        },
        returnOfTheKillerTomatos: {
            title: 'Return of the Killer Tomatoes!',
            year: 1988,
            runtime: '98 min',
            genres: ['Comedy', 'Horror', 'Sci-Fi'],
            tags: ['Hell Yeah'],
            directors: ['John De Bello'],
            writers: ['Stephen Andrich', 'John De Bello', 'Costa Dillon', 'J. Stephen Peace'],
            actors: ['Anthony Starke', 'George Clooney', 'Karen M. Waldron', 'Steve Lundquist'],
            plot: 'Crazy old Professor Gangreen has developed a way to make tomatoes look human for a second invasion.',
            languages: ['English'],
            country: 'USA',
            poster: 'https://images-na.ssl-images-amazon.com/images/M/MV5BOTExZmViMGYtNTBiMy00NmJlLThkNmEtOWFiMWVjMmZmOGUxXkEyXkFqcGdeQXVyMTQ2MjQyNDc@._V1_SX300.jpg'
        },
        getArrayOfExampleMovies: function (count, movie) {
            result = [];
            for (i = 0; i < count; i++) {
                var element = JSON.parse(JSON.stringify(movie));
                delete element._id;
                element.title = i + '';
                result.push(element);
            }
            return result;
        },
    }
};