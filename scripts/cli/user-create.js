#! /usr/bin/env node
'use strict';
var inquirer = require('inquirer');

module.exports = function (UserRepository) {

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
        ]).then(function () {
            return user;
        });
    }

    function save(user) {
        return UserRepository.create(user);
    }

    function init() {
        return inquirer.prompt([
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
                type: 'firstname',
                name: 'firstname',
                message: 'Please enter the firstname!'
            },
            {
                type: 'lastname',
                name: 'lastname',
                message: 'Please enter the lastname!'
            },
            {
                type: 'role',
                name: 'role',
                message: 'Please enter the role!'
            },
            {
                type: 'password',
                name: 'password',
                message: 'Please enter the password!'
            }
        ])
    }

    return {
        do: function () {
            return init()
                .then(confirmPassword)
                .then(save).then(function (user) {
                    console.log('user created!');
                    return user;
                }).catch(function (error) {
                    console.log(error);
                    return null;
                });
        }
    }

};