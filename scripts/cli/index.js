#! /usr/bin/env node
'use strict';

process.env.NODE_ENV = 'development';

var inquirer = require('inquirer');
var debug = require('debug');
var config = require('../../config')[process.env.NODE_ENV];
var errors = require('../../errors/errors');
var mongooseConfig = require("../../mongoose-config")(debug, config).initialize();
var User = require("../../models/user");
var InaktiveUser = require("../../models/inaktive-user");
var UserRepository = require("../../repositories/user-repository")(errors, User, InaktiveUser);
var userCreate = require("./user-create")(UserRepository);
var userUpdate = require("./user-update")(UserRepository);

function start() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'landing',
            message: 'What do you want to do?',
            choices: [
                'create new  user',
                'update existing User',
                'quit'
            ]
        }
    ]).then(function (answers) {
        switch (answers.landing) {
            case "create new  user":
                userCreate.do().then(function (user) {
                    start();
                });
                break;
            case "update existing User":
                userUpdate.do().then(function (user) {
                    start();
                });
                break;
            case "quit":
                quit();
                break;

        }
    });
}
start();

function quit() {
    process.exit();
}