'use strict';

const crypto = require('crypto-random-string');
const db = require('../../storage/main/models/index');
const sendVerificationEmail = require('../sendverificationmail/controller');
console.log(sendVerificationEmail);


const SignUpController = (req, res, next) => {
  console.log(req);
  
  return db.Users.findOrCreate({
    where: { email:  req.body.email },
    defaults: req.body
  })
  .spread((user, created) => {
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
      })
      .catch((error) => {
        return res.status(500).json(error);
      });
    }
  })
  .catch((error) => {
    return res.status(500).json(error);
  });
};

module.exports = SignUpController;