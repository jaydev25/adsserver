'use strict';

const jwt = require('jsonwebtoken');
const config = require('../api/config/' + process.env.NODE_ENV);

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto-random-string');
const db = require('../storage/main/models');
const sendVerificationEmail = require('../api/sendverificationmail/controller');

// The authentication controller.
var AuthController = {};

// Register a user.
AuthController.signUp = function(req, res) {
    const newUser = {
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        createdBy: req.body.createdBy,
        updatedBy: req.body.updatedBy,
    };

    // Attempt to save the user
    return db.Users.findOrCreate({
        where: { email:  req.body.email },
        defaults: newUser
    }).spread((user, created) => {
        // if user email already exists
        if(!created) {
            return res.status(409).json('User with email address already exists');
        } else {
            return db.VerificationToken.create({
                userId: user.id,
                token: crypto(16)
            }).then((result) => {
                sendVerificationEmail(req.body.email, result.token);
                return res.status(200).json(`${req.body.email} account created successfully`);
            }).catch((error) => {
                return res.status(500).json(error);
            });
        }
    }).catch((error) => {
        return res.status(500).json(error);
    });
}

// Compares two passwords.
function comparePasswords(password, userPassword, callback) {
    bcrypt.compare(password, userPassword, function(error, isMatch) {
        if(error) {
            return callback(error);
        }
        return callback(null, isMatch);
    });
}

// Authenticate a user.
AuthController.authenticateUser = function(req, res) {
    if(!req.body.email || !req.body.password) {
        res.status(404).json({ message: 'email and password are needed!' });
    } else {
        const email = req.body.email,
            password = req.body.password,
            potentialUser = { where: { email: email } };

        db.Users.findOne(potentialUser).then(function(user) {
            if(!user) {
                res.status(404).json({ message: 'Authentication failed!' });
            } else {
                comparePasswords(password, user.password, function(error, isMatch) {
                    if(isMatch && !error) {
                        var token = jwt.sign(
                            { email: user.email },
                            config.keys.secret
                        );

                        res.json({
                            success: true,
                            token: 'JWT ' + token,
                            role: user.role
                        });
                    } else {
                        res.status(404).json({ message: 'Login failed!' });
                    }
                });
            }
        }).catch(function(error) {
            res.status(500).json({ message: 'There was an error!' });
        });
    }
}

module.exports = AuthController;