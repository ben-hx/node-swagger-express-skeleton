'use strict';
var q = require('q');

module.exports = function (config, error, Movie) {

    function findByMovieProperty(propertyName) {
        var deferred = q.defer();
        Movie.find().distinct(propertyName).exec().then(function (result) {
            return deferred.resolve(result);
        }).catch(function (error) {
            return deferred.reject(error);
        });
        return deferred.promise;
    }

    return {
        getGenres: function () {
            return findByMovieProperty('genres');
        },
        getDirectors: function () {
            return findByMovieProperty('directors');
        },
        getWriters: function () {
            return findByMovieProperty('writers');
        },
        getActors: function () {
            return findByMovieProperty('actors');
        },
        getLanguages: function () {
            return findByMovieProperty('languages');
        }
    };

}
