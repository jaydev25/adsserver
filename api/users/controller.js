const db = require('../../storage/main/models/index');
const s3 = require('../../helpers/s3');
const Joi = require('joi');
const _ = require('lodash');
const Insta = require('instamojo-nodejs');
const API_KEY = process.env.INSTAMOJO_API_KEY_ADS || 'test_f6dcb6d040f7cdf5fc7884233e8';
const AUTH_KEY = process.env.INSTAMOJO_AUTH_KEY_ADS || 'test_f9531e70b8123199e8cc5467d38';
Insta.setKeys(API_KEY, AUTH_KEY);

// Load the SDK and UUID
const bluebird = require('bluebird');
const updateUser = (req, res) => {
  const schema = Joi.object().keys({
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    // password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
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

  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      const oldUser = {
        firstName: params.firstName,
        lastName: params.lastName,
        contact: params.contact,
        createdBy: params.email,
        updatedBy: params.email,
        country: params.country,
        state: params.state,
        city: params.city,
        birthDate: params.birthDate,
        occupation: params.occupation,
        address: params.address,
        gender: params.gender,
        pincode: params.pincode
      };
      let paymentRequest = {};
      if (params.accType === 'Publisher' && !req.user.Publisher) {
        const payment = new Insta.PaymentData();
        payment.purpose = `Ads app Publisher account fees: ${params.email}`;            // REQUIRED
        payment.amount = 1000;                  // REQUIRED
        payment.phone = params.contact;                  // REQUIRED
        payment.buyer_name = params.firstName + ' ' + params.lastName;                  // REQUIRED
        // payment.redirect_url = 'https://adsserver.herokuapp.com/varifypayment?userId=' + req.user.id + '&matchId=' + params.matchId;                  // REQUIRED
        // payment.send_email = 9;                  // REQUIRED
        payment.webhook = `https://adsserver.herokuapp.com/signup/verifypayment/${params.email}`;                 // REQUIRED
        // payment.send_sms = 9;                  // REQUIRED
        payment.email = params.email;                  // REQUIRED
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
                
                // Attempt to save the user
                return db.sequelize.transaction().then((t) => {
                    return db.Users.update(oldUser, {
                        where: { id:  req.user.id },
                        transaction: t,
                        paymentRequestId: paymentRequest.payment_request.id,
                        data: params
                    }).spread(() => {
                        // if user email already exists
                        return t.commit().then(() => {
                          return res.status(200).json({
                              success: true,
                              url: paymentRequest.payment_request.longurl
                          });
                      });
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
      } else {
        // Attempt to save the user
        return db.sequelize.transaction().then((t) => {
          return db.Users.update(oldUser, {
            where: { id:  req.user.id },
            transaction: t,
            individualHooks: true,
            data: params
          }).spread((user) => {
                // if user email already exists
                return t.commit().then(() => {
                  return res.status(200).json({
                      success: true,
                      message: `${req.body.email} account updated successfully`,
                      email: user.email
                  });
              });
            }).catch((error1) => {
                console.log(error1);
                return t.rollback().then(() => {
                    return res.status(500).json(error1);
                });
            });
        });
      }
    }
  });
}

module.exports = {
  updateUser: updateUser
};
