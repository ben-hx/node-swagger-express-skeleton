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
            create: function (movieData, user) {
                return MovieRepository.create(movieData, user).then(function (movie) {
                    movieData._id = movie._id;
                    movieData.lastModified = movie.lastModified;
                    return movie;
                });
            },
            getAll: MovieRepository.getAll,
            getById: MovieRepository.getById,
            updateById: function (id, movieData, user) {
                return MovieRepository.updateById(id, movieData, user).then(function (movie) {
                    movieData._id = movie._id;
                    movieData.lastModified = movie.lastModified;
                    movieData.lastModifiedUser = movie.lastModifiedUser;
                    return movie;
                });
            },
            deleteById: MovieRepository.deleteById,
            setWatchedByMovieIdAndUserId: MovieRepository.setWatchedByMovieIdAndUserId,
            deleteWatchedByMovieIdAndUserId: MovieRepository.deleteWatchedByMovieIdAndUserId,
            getWatchedByMovieIdAndUserId: MovieRepository.getWatchedByMovieIdAndUserId,
            getUsersWatchedByMovieId: MovieRepository.getUsersWatchedByMovieId,
            getMoviesWatchedByUserId: MovieRepository.getMoviesWatchedByUserId,
            setRatingByMovieIdAndUserId: MovieRepository.setRatingByMovieIdAndUserId,
            deleteRatingByMovieIdAndUserId: MovieRepository.deleteRatingByMovieIdAndUserId,
            getAverageRatingByMovieId: MovieRepository.getAverageRatingByMovieId,
            getRatingByMovieId: MovieRepository.getRatingByMovieId,
            getRatingByMovieIdAndUserId: MovieRepository.getRatingByMovieIdAndUserId
        }
    }
};
