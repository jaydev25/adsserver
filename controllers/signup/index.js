'use strict';

// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto-random-string');
const db = require('../../storage/main/models');
const sendVerificationEmail = require('../sendverificationmail/controller');

// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Load models
// const User = require('./models/user');
// const Chat = require('./models/chat');
// Export the routes for our app to use
module.exports = function(app) {
  // API Route Section

  // Initialize passport for use
  app.use(passport.initialize());

  // Bring in defined Passport Strategy
  require('../config/passport')(passport);

  // Create API group routes
  const apiRoutes = express.Router();

  // Register new users
  apiRoutes.post('/register', function(req, res) {
    console.log(req.body);
    if(!req.body.email || !req.body.password) {
      res.status(400).json({ success: false, message: 'Please enter email and password.' });
    } else {
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
    }
  });

  // Authenticate the user and get a JSON Web Token to include in the header of future requests.
  apiRoutes.post('/authenticate', function(req, res) {
    console.log(req.body);
    return db.Users.findOne({
      where: {
        email: req.body.email
      },
      raw: true
    }).then((user) => {
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
      } else {
        // Check if password matches
        bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
          // res == true
          if (isMatch && !err) {
            const token = jwt.sign(user, config.secret);
            return res.status(200).json({ success: true, token: 'JWT ' + token });
          } else {
            return res.status(401).json({ success: false, message: 'Authentication failed. Passwords did not match.' });
          }
        });
      }
    }).catch((err) => {
      console.log(err);
      
      res.status(500).json({ success: false, message: err });
    });
  });

  // // Protect chat routes with JWT
  // // GET messages for authenticated user
  // apiRoutes.get('/chat', requireAuth, function(req, res) {
  //   Chat.find({$or : [{'to': req.user._id}, {'from': req.user._id}]}, function(err, messages) {
  //     if (err)
  //       res.status(400).send(err);

  //     res.status(400).json(messages);
  //   });
  // });

  // // POST to create a new message from the authenticated user
  // apiRoutes.post('/chat', requireAuth, function(req, res) {
  //   const chat = new Chat();
  //       chat.from = req.user._id;
  //       chat.to = req.body.to;
  //       chat.message_body = req.body.message_body;

  //       // Save the chat message if there are no errors
  //       chat.save(function(err) {
  //           if (err)
  //               res.status(400).send(err);

  //           res.status(201).json({ message: 'Message sent!' });
  //       });
  // });

  // // PUT to update a message the authenticated user sent
  // apiRoutes.put('/chat/:message_id', requireAuth, function(req, res) {
  //   Chat.findOne({$and : [{'_id': req.params.message_id}, {'from': req.user._id}]}, function(err, message) {
  //     if (err)
  //       res.send(err);

  //     message.message_body = req.body.message_body;

  //     // Save the updates to the message
  //     message.save(function(err) {
  //       if (err)
  //         res.send(err);

  //       res.json({ message: 'Message edited!' });
  //     });
  //   });
  // });

  // // DELETE a message
  // apiRoutes.delete('/chat/:message_id', requireAuth, function(req, res) {
  //   Chat.findOneAndRemove({$and : [{'_id': req.params.message_id}, {'from': req.user._id}]}, function(err) {
  //     if (err)
  //       res.send(err);

  //     res.json({ message: 'Message removed!' });
  //   });
  // });

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
