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
                updatedBy: params.email
            };
            return db.sequelize.transaction().then((t) => {
                return db.Users.update(oldUser, {
                    where: { id:  req.user.id },
                    transaction: t,
                    individualHooks: true,
                    user: req.user,
                    data: params
                }).spread(() => {
                    // if user email already exists
                    return t.commit().then(() => {
                        return res.status(200).json({
                            success: true
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
}

const getUserByEmail = (req, res) => {
  const schema = Joi.object().keys({
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }).options({
    stripUnknown: true
  });

  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      const potentialUser = {
        where: { email: params.email },
        include: [{
          model: db.Publishers,
          required: true
        }]
      };

      return db.Users.findOne(potentialUser).then((user) => {
        // if user email already exists
        return res.status(200).json({
          success: true,
          publisherInfo: user
        });
      }).catch((error1) => {
        console.log('find or create');
        console.log(error1);
        return res.status(500).json(error1);
      });
    }
  });
}

module.exports = {
  updateUser: updateUser,
  getUserByEmail: getUserByEmail
};
