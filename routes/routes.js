'use strict';


module.exports = function (router, diContainer) {

    var basicAuth = diContainer.getBasicAuthentication().middleware;

    function userRoutes() {
        var register = router.route('/register');
        register.post(diContainer.getUserController().register);

        var me = router.route('/me');
        me.get(basicAuth, diContainer.getUserController().getMe);

        var verifyPassword = router.route('/verify_password');
        verifyPassword.get(basicAuth, diContainer.getUserController().verifyPassword);

        var changePassword = router.route('/change_password');
        changePassword.put(basicAuth, diContainer.getUserController().changePassword);

        var activate = router.route('/users/:inaktive_user_id/activate');
        activate.post(basicAuth, diContainer.getUserController().activate);

        var setRole = router.route('/users/:user_id/role/:new_role_name');
        setRole.post(basicAuth, diContainer.getUserController().setRole);

        var users = router.route('/users/:user_id');
        users.delete(basicAuth, diContainer.getUserController().deleteUser);

        var users = router.route('/users');
        users.get(basicAuth, diContainer.getUserController().getUsers);

        var inaktiveUsers = router.route('/inaktive_users');
        inaktiveUsers.get(basicAuth, diContainer.getUserController().getInaktiveUsers);

        var inaktiveUser = router.route('/inaktive_users/:inaktive_user_id');
        inaktiveUsers.delete(basicAuth, diContainer.getUserController().deleteInaktiveUser);
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
        movieWatched.put(basicAuth, diContainer.getMovieController().watch);

        var movieUnwatched = router.route('/movies/:movie_id/unwatched');
        movieUnwatched.put(basicAuth, diContainer.getMovieController().unwatch);

        var movieRatings = router.route('/movies/:movie_id/rating');
        movieRatings.put(basicAuth, diContainer.getMovieController().rate);
        movieRatings.delete(basicAuth, diContainer.getMovieController().deleteRating);

        var movieComments = router.route('/movies/:movie_id/comments');
        movieComments.put(basicAuth, diContainer.getMovieController().comment);

        var movieComment = router.route('/movies/:movie_id/comments/:comment_id');
        movieComment.delete(basicAuth, diContainer.getMovieController().deleteComment);
    }

    userRoutes();
    movieRoutes();

    return router;
};
