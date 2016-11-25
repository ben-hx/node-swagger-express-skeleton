module.exports = function (Movie) {
    return {
        getMovieDataCreatedFromUser: function (movieData, userData) {
            movieData.lastModifiedUser = userData._id;
            return movieData;
        },
        saveExampleMovie: function (movieData) {
            var movie = new Movie(movieData);
            return movie.save().then(function (movie) {
                movieData._id = movie._id;
                movieData.lastModified = movie.lastModified;
                return movie;
            });
        },
        saveExampleMovieFromUser: function (movieData, userData) {
            movieData = this.getMovieDataCreatedFromUser(movieData, userData);
            var movie = new Movie(movieData);
            return movie.save().then(function (movie) {
                movieData._id = movie._id;
                movieData.lastModified = movie.lastModified;
                return movie;
            });
        }
    }
};
