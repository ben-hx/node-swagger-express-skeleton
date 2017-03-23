var q = require('q');
var sinon = require("sinon");

module.exports = function (MovieList, MovieListRepository) {
    var fakeClock = null;
    var tickTime = 3600000;
    return {
        initTime: function () {
            fakeClock = sinon.useFakeTimers(0, "Date");
        },
        saveExampleMovieListItem: function (data) {
            var movieList = new MovieList(data);
            return movieList.save().then(function (result) {
                return result;
            });
        },
        saveExampleMovieList: function (itemCount, options) {

            function saveMovieWithTimeTick(index) {
                return q.fcall(function () {
                    var data = {
                        title: (options.title || 'testTitle' ) + index,
                        description: 'testDescription' + index,
                        movies: options.movies,
                        access: options.access || 'private',
                        editableUsers: options.editableUsers,
                        createdUser: options.createdUser,
                        tags: ['testTag' + index, 'testTagForAll']
                    };
                    fakeClock.tick(tickTime);
                    return (new MovieList(data)).save().then(function (result) {
                        fakeClock.tick(tickTime);
                        return MovieList.populate(result, 'createdUser movies.movie editableUsers.user comments.user');
                    }).then(function (result) {
                        return result.toObject();
                    });
                });
            }

            var sequence = q.resolve();
            var movieListArray = [];
            var index = 0;
            for (var i = 0; i < itemCount; i++) {
                sequence = sequence.then(function () {
                    return saveMovieWithTimeTick(index);
                }).then(function (result) {
                    index++;
                    movieListArray.push(result);
                });
            }
            return q.when(sequence).then(function () {
                return movieListArray;
            });
        },

        repository: {
            forUser: function (user) {
                return new MovieListRepository.forUser(user);
            }
        }
    }
};
