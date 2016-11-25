module.exports = function (MovieRepository) {
    return {
        create: function (movieData, user) {
            return MovieRepository.create(movieData, user).then(function (movie) {
                movieData._id = movie._id;
                movieData.lastModified = movie.lastModified;
                return movie;
            });
        },
        getAll: function (options) {
            return MovieRepository.getAll(options);
        },
        getById: function (id) {
            return MovieRepository.getById(id);
        },
        updateById: function (id, movieData, user) {
            return MovieRepository.updateById(id, movieData, user).then(function (movie) {
                movieData._id = movie._id;
                movieData.lastModified = movie.lastModified;
                movieData.lastModifiedUser = movie.lastModifiedUser;
                return movie;
            });
        },
        deleteById: function (id) {
            return MovieRepository.deleteById(id);
        },
    }
};
