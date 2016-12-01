#! /usr/bin/env node
'use strict';

process.env.NODE_ENV = 'test';

var inquirer = require('inquirer');
var debug = require('debug');
var config = require('../config');
var errors = require('../errors/errors');
var mongooseConfig = require("../mongoose-config")(debug, config).initialize();
var User = require("../models/user");
var InaktiveUser = require("../models/inaktive-user");
var UserRepository = require("../repositories/user-repository")(config, errors, User, InaktiveUser);

function start() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'theme',
            message: 'What do you want to do?',
            choices: [
                'create new  user',
                'update existing User'
            ]
        }
    ]).then(function (answers) {
        if (answers.theme == 'create new  user') {
            createUser();
        }
    });
}
start();

function createUser() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Please enter the username!'
        },
        {
            type: 'input',
            name: 'email',
            message: 'Please enter the email!'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Please enter the password!'
        }
    ]).then(function (answers) {
        confirmPassword(answers);
    });
}

function confirmPassword(user) {
    return inquirer.prompt([
        {
            type: 'password',
            name: 'confirm',
            message: 'Please confirm your password!',
            validate: function (input) {
                if (input != user.password) {
                    return 'Please confirm the right password!'
                }
                return true;
            }
        }
    ]).then(function (answers) {
        saveUser(user);
    });
}

function saveUser(user) {
    UserRepository.create(user).then(function (user) {
        inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'User ' + user.username + ' created! Do you want to do something more?',
            }
        ]).then(function (answers) {
            if (answers.confirm) {
                start();
            }
        });
    }).catch(function (error) {
        inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Validation failed. Do you want to try again?!',
            }
        ]).then(function (answers) {
            if (answers.confirm) {
                createUser();
            } else {
                console.log("fuck you!");
            }
        });
    });
}