'use strict';

var router = require('express').Router();

module.exports = function (diContainer) {

    var basicAuth = diContainer.getBasicAuthentication().middleware;
    var userController = diContainer.getUserController();
    var movieController = diContainer.getMovieController();
    var movieListController = diContainer.getMovieListController();
    var postController = diContainer.getPostController();

    router.post('/register', userController.register);
    router.get('/me', basicAuth, userController.getMe);
    router.put('/me', basicAuth, userController.update);
    router.put('/verify_password', basicAuth, userController.verifyPassword);
    router.put('/change_password', basicAuth, userController.changePassword);
    router.post('/users/:inaktive_user_id/activate', basicAuth, userController.activate);
    router.post('/users/:user_id/role/:new_role_name', basicAuth, userController.setRole);
    router.delete('/users/:user_id', basicAuth, userController.deleteUser);
    router.get('/users', basicAuth, userController.getUsers);
    router.get('/inaktive_users', basicAuth, userController.getInaktiveUsers);
    router.delete('/inaktive_users/:inaktive_user_id', basicAuth, userController.deleteInaktiveUser);

    router.post('/movies', basicAuth, movieController.create);
    router.get('/movies', basicAuth, movieController.getAll);
    router.get('/movies/genres', basicAuth, movieController.getGenres);
    router.get('/movies/actors', basicAuth, movieController.getActors);
    router.get('/movies/tags', basicAuth, movieController.getTags);
    router.get('/movies/:movie_id', basicAuth, movieController.get);
    router.put('/movies/:movie_id', basicAuth, movieController.update);
    router.delete('/movies/:movie_id', basicAuth, movieController.delete);
    router.put('/movies/:movie_id/watched', basicAuth, movieController.watch);
    router.put('/movies/:movie_id/unwatched', basicAuth, movieController.unwatch);
    router.put('/movies/:movie_id/rating', basicAuth, movieController.rate);
    router.delete('/movies/:movie_id/rating', basicAuth, movieController.deleteRating);
    router.post('/movies/:movie_id/comments', basicAuth, movieController.comment);
    router.delete('/movies/:movie_id/comments/:comment_id', basicAuth, movieController.deleteComment);

    router.post('/movie_lists', basicAuth, movieListController.create);
    router.get('/movie_lists', basicAuth, movieListController.getAll);
    router.get('/movie_lists/:movie_list_id', basicAuth, movieListController.get);
    router.put('/movie_lists/:movie_list_id', basicAuth, movieListController.update);
    router.delete('/movie_lists/:movie_list_id', basicAuth, movieListController.delete);
    router.post('/movie_lists/:movie_list_id/comments', basicAuth, movieListController.comment);
    router.delete('/movie_lists/:movie_list_id/comments/:comment_id', basicAuth, movieListController.deleteComment);

    router.post('/posts', basicAuth, postController.create);
    router.get('/posts', basicAuth, postController.getAll);
    router.get('/posts/:post_id', basicAuth, postController.get);
    router.put('/posts/:post_id', basicAuth, postController.update);
    router.delete('/posts/:post_id', basicAuth, postController.delete);
    router.post('/posts/:post_id/comments', basicAuth, postController.comment);
    router.delete('/posts/:post_id/comments/:comment_id', basicAuth, postController.deleteComment);

    return router;
};