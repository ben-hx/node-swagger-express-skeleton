'use strict';


module.exports = function (router, diContainer) {

    var basicAuth = diContainer.getBasicAuthentication().middleware;

    function userRoutes() {
        var register = router.route('/register');
        register.post(diContainer.getUserController().register);

        var register = router.route('/me');
        register.get(basicAuth, diContainer.getUserController().getMe);

        var activate = router.route('/users/:inaktive_user_id/activate');
        activate.post(basicAuth, diContainer.getUserController().activate);

        var setRole = router.route('/users/:user_id/role/:new_role_name');
        setRole.post(basicAuth, diContainer.getUserController().setRole);

        var users = router.route('/users');
        users.get(basicAuth, diContainer.getUserController().getUsers);

        var inaktiveUsers = router.route('/inaktive_users');
        inaktiveUsers.get(basicAuth, diContainer.getUserController().getInaktiveUsers);
    }


    function movieRoutes() {
        var movies = router.route('/movies');
        movies.post(basicAuth, diContainer.getMovieController().create);
        movies.get(basicAuth, diContainer.getMovieController().getAll);

        var movie = router.route('/movies/:movie_id');
        movie.get(basicAuth, diContainer.getMovieController().get);
        movie.put(basicAuth, diContainer.getMovieController().update);
        movie.delete(basicAuth, diContainer.getMovieController().delete);

        var movieWatched = router.route('/movies/:movie_id/watched');
        movieWatched.get(basicAuth, diContainer.getMovieController().getWatched);
        movieWatched.put(basicAuth, diContainer.getMovieController().watch);

        var movieUnwatched = router.route('/movies/:movie_id/unwatched');
        movieUnwatched.put(basicAuth, diContainer.getMovieController().unwatch);

        var movieRating = router.route('/movies/:movie_id/rating');
        movieRating.get(basicAuth, diContainer.getMovieController().getRating);
        movieRating.put(basicAuth, diContainer.getMovieController().rate);
        movieRating.delete(basicAuth, diContainer.getMovieController().deleteRating);

    }


    userRoutes();
    movieRoutes();

    return router;
};
