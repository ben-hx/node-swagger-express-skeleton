var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function () {
    return {
        evaluateMovie: function (actualMovie, expectedMovie) {
            actualMovie.should.deep.equal(expectedMovie);
        },
        evaluateMovies: function (actualMovies, expectedMovies) {
            actualMovies.should.have.length(expectedMovies.length);
            actualMovies.should.deep.include.members(expectedMovies);
        }
    }
};
