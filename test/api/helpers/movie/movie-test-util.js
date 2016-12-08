module.exports = function (Movie, MovieWatched, MovieRating, MovieRepository) {
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
        repositoryDecorator: {
            forUser: function (user) {
                return {
                    create: function (movieData) {
                        return MovieRepository.forUser(user).create(movieData).then(function (movie) {
                            movieData._id = movie._id;
                            movieData.lastModified = movie.lastModified;
                            return movie;
                        });
                    },
                    getAll: MovieRepository.forUser(user).getAll,
                    getById: MovieRepository.forUser(user).getById,
                    updateById: function (id, movieData) {
                        return MovieRepository.forUser(user).updateById(id, movieData).then(function (movie) {
                            movieData._id = movie._id;
                            movieData.lastModified = movie.lastModified;
                            movieData.lastModifiedUser = movie.lastModifiedUser;
                            return movie;
                        });
                    },
                    deleteById: MovieRepository.forUser(user).deleteById,
                    setWatchedById: MovieRepository.forUser(user).setWatchedById,
                    deleteWatchedById: MovieRepository.forUser(user).deleteWatchedById,
                    setRatingById: MovieRepository.forUser(user).setRatingById,
                    deleteRatingById: MovieRepository.forUser(user).deleteRatingById
                }
            }
        }
    }
};
