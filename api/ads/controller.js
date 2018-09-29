const db = require('../../storage/main/models/index');
const s3 = require('../../helpers/s3');
const Joi = require('joi');
// Load the SDK and UUID

const createAd = (req, res) => {
  console.log(req.body);
  
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string(),
    catId: Joi.number().required(),
    subcatid: Joi.number().required(),
    media: Joi.array()
  }).options({
    stripUnknown: true
  });

  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      if (!req.user.Publisher) {
        console.log(req.user.Publisher);
        return res.status(422).json('You need to signup as Publisher to post your own Ads.');
      } else if (!req.user.Publisher.isPaymentVerified) {
        return res.status(422).json('Please complete the payment to post Ads');
      }
      s3.uploadFile();
      
    }
  });
}

module.exports = {
  createAd: createAd
};