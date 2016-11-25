'use strict';

var q = require('q');

module.exports = function (config, errors, Movie) {

    function castQueryParamByOptionalArray(param) {
        if (param) {
            if (param instanceof Array) {
                return {"$in": param};
            } else {
                return param;
            }
        }
        return undefined;
    }

    function castQueryParamByBeginning(param) {
        if (param) {
            return {"$regex": param, "$options": "i"};
        }
        return undefined;
    }

    function removeUndefinedPropertyOfObject(object) {
        return JSON.parse(JSON.stringify(object));
    }

    return {
        create: function (movieData, user) {
            var deferred = q.defer();
            movieData.lastModifiedUser = user._id;
            var movie = new Movie(movieData);
            movie.save().then(function (movie) {
                return deferred.resolve(movie.toObject());
            }).catch(function (error) {
                return deferred.reject(new errors.ValidationError(error));
            });
            return deferred.promise;
        },
        getAll: function (options) {
            var deferred = q.defer();
            options = options || {};
            var query = options.query || {};
            var sort = options.sort || '';
            var pagination = options.pagination || {};
            var options = {
                query: {
                    title: castQueryParamByBeginning(query.title),
                    actors: castQueryParamByBeginning(query.actors),
                    year: castQueryParamByOptionalArray(query.years),
                    genres: castQueryParamByOptionalArray(query.genres),
                    lastModifiedUser: castQueryParamByOptionalArray(query.lastModifiedUser)
                },
                sort: sort || config[process.env.NODE_ENV].settings.movie.moviesSortDefault,
                page: parseInt(pagination.page) || 0,
                limit: parseInt(pagination.limit) || config[process.env.NODE_ENV].settings.movie.moviesPerPageDefault
            };
            options = removeUndefinedPropertyOfObject(options);
            Movie.paginate(options).then(function (result) {
                var docs = result.docs.map(function (movie) {
                    return movie.toObject();
                });
                return deferred.resolve({movies: docs, pagination: result.pagination});
            }).catch(function (error) {
                return deferred.reject(error);
            });
            return deferred.promise;
        },
        getById: function (id) {
            var deferred = q.defer();
            Movie.findOne({_id: id}).then(function (movie) {
                if (movie == null) {
                    throw new errors.NotFoundError('Movie does not exist!');
                } else {
                    return deferred.resolve(movie.toObject());
                }
            }).catch(function (error) {
                if (!(error instanceof errors.NotFoundError)) {
                    return deferred.reject(new errors.ValidationError(error));
                }
                return deferred.reject(error);
            });
            return deferred.promise;
        },
        updateById: function (id, movieData, user) {
            var deferred = q.defer();
            movieData = Object.assign({}, movieData);
            movieData.lastModifiedUser = user._id;
            var self = this;
            Movie.update({_id: id}, movieData, {runValidators: true}).then(function (result) {
                return self.getById(id);
            }).then(function (movie) {
                return deferred.resolve(movie);
            }).catch(function (error) {
                if (!(error instanceof errors.NotFoundError)) {
                    return deferred.reject(new errors.ValidationError(error));
                }
                return deferred.reject(error);
            });
            return deferred.promise;
        },
        deleteById: function (id) {
            var deferred = q.defer();
            Movie.findOneAndRemove({_id: id}).then(function (movie) {
                if (movie == null) {
                    throw new errors.NotFoundError('Movie does not exist!');
                } else {
                    return deferred.resolve(movie.toObject());
                }
            }).catch(function (error) {
                if (!(error instanceof errors.NotFoundError)) {
                    return deferred.reject(new errors.ValidationError(error));
                }
                return deferred.reject(error);
            });
            return deferred.promise;
        },




    }
};