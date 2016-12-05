#! /usr/bin/env node
'use strict';
var inquirer = require('inquirer');

module.exports = function (UserRepository) {

    function getUsers() {
        return UserRepository.getUsers().then(function (result) {
            var users = result.users.map(function (value) {
                return {name: value.email, value: value}
            });
            return users;
        });
    }

    function selectUser(users) {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'user',
                message: 'Please select a user?',
                choices: users
            }
        ]).then(function (answers) {
            return answers.user;
        });
    }

    function editSelection(user) {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'selection',
                message: 'What do you want to do?',
                choices: [
                    {name: 'change role', value: 'role'},
                    {name: 'change username', value: 'username'},
                    {name: 'change email', value: 'email'},
                    {name: 'change firstname', value: 'firstname'},
                    {name: 'change lastname', value: 'lastname'},
                    {name: 'go back', value: ''},
                ]
            }
        ]).then(function (answer) {
            if (answer.selection == '') {
                return null;
            }
            return updateField(answer.selection, user)
        });
    }

    function updateField(fieldName, user) {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'updatedValue',
                message: 'Please enter the ' + fieldName,
                validate: function (input) {
                    var data = [];
                    data[fieldName] = input;
                    return UserRepository.updateById(user._id, data).then(function () {
                        return true;
                    }).catch(function (error) {
                        return error.message;
                    });
                }
            },
        ]).then(function (answer) {
            console.log('user updated!');
            return user;
        });
    }

    return {
        do: function () {
            return getUsers().then(selectUser).then(editSelection).then(function (user) {
                return user;
            });
        }
    }

};