#! /usr/bin/env node
'use strict';

var inquirer = require('inquirer');
var debug = require('debug')('app');
var config = require('../../config')[process.env.NODE_ENV];
var errors = require('../../errors/errors');
var mongooseConfig = require("../../mongoose-config")(debug, config);
var User = require("../../models/user");
var InaktiveUser = require("../../models/inaktive-user");
var UserRepository = require("../../repositories/user-repository")(errors, User, InaktiveUser);
var userCreate = require("./user-create")(UserRepository);
var userUpdate = require("./user-update")(UserRepository);

function showPromts() {
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

function start() {
    mongooseConfig.initialize().then(showPromts).catch(function () {
        debug("Sorry, the db is not working!");
        quit();
    });
}
start();

function quit() {
    process.exit();
}