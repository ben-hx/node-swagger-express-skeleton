module.exports = function (Movie, MovieUserAction, MovieRepository) {

    function MovieRepositoryDecorator(movieRepository) {
        this.create = function (movieData) {
            return movieRepository.create(movieData).then(function (movie) {
                movieData._id = movie._id;
                movieData.lastModified = movie.lastModified;
                return movie;
            });
        };
        this.getAll = function (options) {
            return movieRepository.getAll(options);
        };
        this.getById = function (id) {
            return movieRepository.getById(id);
        };
        this.updateById = function (id, movieData) {
            return movieRepository.updateById(id, movieData).then(function (movie) {
                movieData._id = movie._id;
                movieData.lastModified = movie.lastModified;
                movieData.lastModifiedUser = movie.lastModifiedUser;
                return movie;
            });
        };
        this.deleteById = function (id) {
            return movieRepository.deleteById(id);
        };
        this.setWatchedById = function (id) {
            return movieRepository.setWatchedById(id);
        };
        this.deleteWatchedById = function (id) {
            return movieRepository.deleteWatchedById(id);
        };
        this.setRatingById = function (id, value) {
            return movieRepository.setRatingById(id, value);
        };
        this.deleteRatingById = function (id) {
            return movieRepository.deleteRatingById(id);
        };
    }

    return {
        saveExampleMovieFromUser: function (movieData, userData) {
            movieData.lastModifiedUser = userData._id;
            var movie = new Movie(movieData);
            return movie.save().then(function (movie) {
                movieData._id = movie._id;
                movieData.lastModified = movie.lastModified;
                return movie;
            });
        },
        watchExampleMovieFromUser: function (movieData, userData) {
            var data = {
                user: userData._id,
                movie: movieData._id
            };
            return (new MovieWatched(data)).save();
        },
        rateExampleMovieFromUser: function (movieData, userData, value) {
            var data = {
                user: userData._id,
                movie: movieData._id,
                value: value
            };
            return (new MovieRating(data)).save();
        },
        repository: {
            forUser: function (user) {
                return new MovieRepositoryDecorator(new MovieRepository(user));
            }
        }
    }
};
