'use strict';

const jwt = require('jsonwebtoken');
const config = require('../api/config/' + process.env.NODE_ENV);
let bcrypt, salt;
const Insta = require('instamojo-nodejs');
const API_KEY = process.env.INSTAMOJO_API_KEY_ADS || 'test_f6dcb6d040f7cdf5fc7884233e8';
const AUTH_KEY = process.env.INSTAMOJO_AUTH_KEY_ADS || 'test_f9531e70b8123199e8cc5467d38';
Insta.setKeys(API_KEY, AUTH_KEY);

if (process.env.NODE_ENV === 'development') {
    bcrypt = require('bcrypt-nodejs');
} else {
    bcrypt = require('bcrypt');
    const saltRounds = 10;
    salt = bcrypt.genSaltSync(saltRounds);
}
const crypto = require('crypto-random-string');
const db = require('../storage/main/models');
const sendVerificationEmail = require('../api/sendverificationmail/controller');
const Joi = require('joi');
// The authentication controller.
var AuthController = {};

// Register a user.
AuthController.signUp = function(req, res) {
    const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        accType: Joi.string().valid(['Subscriber', 'Publisher']).required(),
        contact: Joi.string().required(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        birthDate: Joi.date().required(),
        occupation: Joi.string().required(),
        address: Joi.string().required(),
        gender: Joi.string().required(),
        pincode: Joi.number().required()
    }).options({
        stripUnknown: true
    });

    return Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return res.status(422).json(err.details[0].message);
        } else {
            const newUser = {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                contact: req.body.contact,
                createdBy: req.body.email,
                updatedBy: req.body.email
            };
            let paymentRequest = {};
            if (value.accType === 'Publisher') {
                const payment = new Insta.PaymentData();
                payment.purpose = `Ads app Publisher account fees: ${value.email}`;            // REQUIRED
                payment.amount = 1000;                  // REQUIRED
                payment.phone = value.contact;                  // REQUIRED
                payment.buyer_name = value.firstName + ' ' + value.lastName;                  // REQUIRED
                // payment.redirect_url = 'https://adsserver.herokuapp.com/varifypayment?userId=' + req.user.id + '&matchId=' + value.matchId;                  // REQUIRED
                // payment.send_email = 9;                  // REQUIRED
                payment.webhook = `https://adsserver.herokuapp.com/signup/verifypayment/${value.email}`;                 // REQUIRED
                // payment.send_sms = 9;                  // REQUIRED
                payment.email = value.email;                  // REQUIRED
                payment.allow_repeated_payments = false;                  // REQUIRED
                // payment.setRedirectUrl(REDIRECT_URL);
                Insta.isSandboxMode(true);
                Insta.createPayment(payment, function(error, response) {
                    if (error) {
                        // some error
                        console.log(error);
                        return res.status(500).json(error);
                    } else {
                        paymentRequest = JSON.parse(response);
                        console.log(paymentRequest);
                        // return res.status(200).json({
                        //     success: true,
                        //     url: paymentRequest.payment_request.longurl
                        // });

                        // return res.status(200).json(paymentRequest.payment_request.longurl);
                        // Payment redirection link at paymentRequest.payment_request.longurl
                        
                        if (process.env.NODE_ENV === 'development') {
                            newUser.password = bcrypt.hashSync(req.body.password);
                        } else {
                            newUser.password = bcrypt.hashSync(req.body.password, salt);
                        }
                        // Attempt to save the user
                        return db.sequelize.transaction().then((t) => {
                            return db.Users.findOrCreate({
                                where: { email:  req.body.email },
                                defaults: newUser,
                                transaction: t,
                                paymentRequestId: paymentRequest.payment_request.id,
                                data: value
                            }).spread((user, created) => {
                                // if user email already exists
                                if(!created) {
                                    return res.status(409).json('User with email address already exists');
                                } else {
                                    return db.VerificationToken.create({
                                        userId: user.id,
                                        token: crypto(16)
                                    }, { transaction: t }).then((result) => {
                                        return sendVerificationEmail.sendVerificationEmail(req.body.email, result.token).then(() => {
                                            return t.commit().then(() => {
                                                return res.status(200).json({
                                                    success: true,
                                                    url: paymentRequest.payment_request.longurl
                                                });
                                            });
                                        }).catch((err) => {
                                            console.log(err);
                                            return t.rollback().then(() => {
                                                return res.status(500).json(err);
                                            });
                                        });
                                    }).catch((error) => {
                                        console.log(error);
                                        return t.rollback().then(() => {
                                            return res.status(500).json(error);
                                        });
                                    });
                                }
                            }).catch((error1) => {
                                console.log('find or create');
                                console.log(error1);
                                return t.rollback().then(() => {
                                    return res.status(500).json(error1);
                                });
                            });
                        });
                    }
                });                               
            } else if (value.accType === 'Subscriber') {
                if (process.env.NODE_ENV === 'development') {
                    newUser.password = bcrypt.hashSync(req.body.password);
                } else {
                    newUser.password = bcrypt.hashSync(req.body.password, salt);
                }
                // Attempt to save the user
                return db.sequelize.transaction().then((t) => {
                    return db.Users.findOrCreate({
                        where: { email:  req.body.email },
                        defaults: newUser,
                        transaction: t,
                        data: value
                    }).spread((user, created) => {
                        // if user email already exists
                        if(!created) {
                            return res.status(409).json('User with email address already exists');
                        } else {
                            return db.VerificationToken.create({
                                userId: user.id,
                                token: crypto(16)
                            }, { transaction: t }).then((result) => {
                                return sendVerificationEmail.sendVerificationEmail(req.body.email, result.token).then(() => {
                                    return t.commit().then(() => {
                                        return res.status(200).json({
                                            success: true,
                                            message: `${req.body.email} account created successfully`,
                                            email: user.email
                                        });
                                    });
                                }).catch((err) => {
                                    console.log(err);
                                    return t.rollback().then(() => {
                                        return res.status(500).json(err);
                                    });
                                });
                            }).catch((error) => {
                                console.log(error);
                                return t.rollback().then(() => {
                                    return res.status(500).json(error);
                                });
                            });
                        }
                    }).catch((error1) => {
                        console.log(error1);
                        return t.rollback().then(() => {
                            return res.status(500).json(error1);
                        });
                    });
                });
            }
        }
    });  // err === null -> valid
}

AuthController.verifypayment = (req, res) => {
    const schema = Joi.object().keys({
      amount: Joi.number().required(),
      buyer: Joi.string().required(),
      currency: Joi.string().required(),
      fees: Joi.number().required(),
      purpose: Joi.string().required(),
      status: Joi.string().required(),
      mac: Joi.string().required(),
      buyer_name: Joi.string().required(),
      buyer_phone: Joi.string().required(),
      payment_id: Joi.string().required(),
      payment_request_id: Joi.string().required()
    }).options({
      stripUnknown: true
    });
    return Joi.validate(req.body, schema, function (err, params) {
      if (err) {
        console.log(err);
        return res.status(422).json(err.details[0].message);
      } else if (params.status === 'Credit') {
        return db.Users.findOne({
            attributes: ['id'],
            where: {
                email: req.params.email
            },
            raw: true
        }).then((user) => {
            return db.Publishers.update({
                isPaymentVerified: true,
                paymentId: params.payment_id,
                createdBy: params.buyer,
                updatedBy: params.buyer
              }, {
                where: {
                  userId: user.id,
                  paymentRequestId: params.payment_request_id  
                }
            }).then(data => {
                return res.status(200).json(data);
            }).catch(reason => {
                console.log(reason);
                return res.status(404).json(reason);
            });
        }).catch((err) => {
            console.log(err);
            return res.status(500).json(err);
        });
      }
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
    const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
    }).options({
        stripUnknown: true
    });

    return Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return res.status(422).json(err.details[0].message);
        } else {
            const email = req.body.email,
                password = req.body.password,
                potentialUser = { 
                    where: { email: email },
                    include: [{
                        model: db.Publishers,
                        required: false
                    }, {
                        model: db.Subscribers,
                        required: false
                    }]
                };

            return db.Users.findOne(potentialUser).then(function(user) {
                if(!user) {
                    return res.status(404).json('Authentication failed!');
                } else {
                    if (!user.isVerified) {
                        return res.status(404).json('Please verify your Email!');
                    }
                    
                    if (user.Publisher && !user.Publisher.isPaymentVerified) {
                        const payment = new Insta.PaymentData();
                        payment.purpose = `Ads app Publisher account fees: ${user.email}`;            // REQUIRED
                        payment.amount = 1000;                  // REQUIRED
                        payment.phone = user.contact;                  // REQUIRED
                        payment.buyer_name = user.firstName + ' ' + user.lastName;                  // REQUIRED
                        // payment.redirect_url = 'https://adsserver.herokuapp.com/varifypayment?userId=' + req.user.id + '&matchId=' + value.matchId;                  // REQUIRED
                        // payment.send_email = 9;                  // REQUIRED
                        payment.webhook = `https://adsserver.herokuapp.com/signup/verifypayment/${user.email}`;                 // REQUIRED
                        // payment.send_sms = 9;                  // REQUIRED
                        payment.email = user.email;                  // REQUIRED
                        payment.allow_repeated_payments = false;                  // REQUIRED
                        // payment.setRedirectUrl(REDIRECT_URL);
                        Insta.isSandboxMode(true);
                        Insta.createPayment(payment, function(error, response) {
                            if (error) {
                                // some error
                                console.log(error);
                                return res.status(500).json(error);
                            } else {
                                const paymentRequest = JSON.parse(response);
                                console.log(paymentRequest);
                                user.Publisher.paymentRequestId = paymentRequest.payment_request.id;
                                user.Publisher.save().then(() => {
                                    return res.status(200).json({
                                        needPayment: true,
                                        url: paymentRequest.payment_request.longurl
                                    });
                                }).catch((err) => {
                                    console.log(err);
                                    res.status(500).json(err);
                                });
                                // return res.status(200).json(paymentRequest.payment_request.longurl);
                                // Payment redirection link at paymentRequest.payment_request.longurl
                            }
                        });
                    } else {
                        comparePasswords(password, user.password, function(error, isMatch) {
                            if(isMatch && !error) {
                                var token = jwt.sign(
                                    { email: user.email },
                                    config.keys.secret
                                );

                                return res.json({
                                    success: true,
                                    token: 'JWT ' + token,
                                    role: user.role
                                });
                            } else {
                                return res.status(404).json('Login failed!');
                            }
                        });
                    }
                }
            }).catch(function(error) {
                return res.status(500).json('There was an error!');
            });
        }
    });
}

module.exports = AuthController;