const db = require('../../storage/main/models/index');
const s3 = require('../../helpers/s3');
const Joi = require('joi');
// Load the SDK and UUID
const bluebird = require('bluebird');
const createAd = (req, res) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string(),
    catId: Joi.number(),
    subcatId: Joi.number(),
    images: Joi.array ()
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
      return db.sequelize.transaction().then((t) => {
        return db.Ads.create({
          userId: req.user.id,
          title: params.title,
          description: params.description,
          catId: params.catId,
          subcatId: params.subcatId,
          createdBy: req.user.email,
          updatedBy: req.user.email
        }, {
          transaction: t
        }).then((ad) => {
          console.log(db.sequelize);
          
          return bluebird.mapSeries(params.images, (image, index) => {
            const base64Data = new Buffer(image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
            const type = image.split(';')[0].split('/')[1];
            const contentType = s3.base64MimeType(image);
            
            const key = 'test/ads/' + req.user.id + '/' + ad.id + '_' + index;
            return db.AdsMedia.create({
              adId: ad.id,
              media: key,
              mediaURL: `${key}.${type}`,
              mediaType: contentType,
              createdBy: req.user.email,
              updatedBy: req.user.email
            }, {
              transaction: t
            }).then(() => {
              return s3.uploadFile(key, base64Data, type, contentType, 'base64');
            });
          }).then(() => {
            return t.commit().then(() => {
              return res.status(200).json('Created Successfully');
            });
          });
        }).catch((err) => {
          return res.status(500).json('Somthing went wrong' + err);
        });
      });
    }
  });
}

const listing = (req, res) => {
  const schema = Joi.object().keys({
    offset: Joi.number().required()
  }).options({
    stripUnknown: true
  });

  return Joi.validate(req.query, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      return db.Ads.findAll({
        include: [{
          model: db.Users,
          attributes: ['id', 'email', 'contact'],
          where: {
            isVerified: true
          }
        }, {
          model: db.AdsMedia,
          required: false
        }],
        order: [
          ['createdAt', 'DESC']
        ],
        offset: params.offset,
        limit: 20
      }).then(ads => {
        return res.status(200).json(ads);
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Matches not found`);
      });
    }
  });
}

const getMetaData = (req, res) => {
  return db.Categories.findAll({
    attributes: ['id', 'name'],
    include: [{
      model: db.Subcategories,
      attributes: ['id', 'catId', 'name']
    }]
  }).then(data => {
    return res.status(200).json(data);
  }).catch(reason => {
    console.log(reason);
    return res.status(404).json(`Data not found`);
  });
}

module.exports = {
  createAd: createAd,
  listing: listing,
  getMetaData: getMetaData
};