'use strict';

var url = require('url');


var Post = require('./PostService');


module.exports.add = function add (req, res, next) {
  Post.add(req.swagger.params, res, next);
};

module.exports.findByRelease = function findByRelease (req, res, next) {
  Post.findByRelease(req.swagger.params, res, next);
};

module.exports.findByTags = function findByTags (req, res, next) {
  Post.findByTags(req.swagger.params, res, next);
};

module.exports.getByID = function getByID (req, res, next) {
  Post.getByID(req.swagger.params, res, next);
};

module.exports.remove = function remove (req, res, next) {
  Post.remove(req.swagger.params, res, next);
};

module.exports.update = function update (req, res, next) {
  Post.update(req.swagger.params, res, next);
};

module.exports.updateWithForm = function updateWithForm (req, res, next) {
  Post.updateWithForm(req.swagger.params, res, next);
};

module.exports.uploadFile = function uploadFile (req, res, next) {
  Post.uploadFile(req.swagger.params, res, next);
};
