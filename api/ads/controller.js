const db = require('../../storage/main/models/index');
const s3 = require('../../helpers/s3');
const Joi = require('joi');
const _ = require('lodash');
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
          classId: 1,
          createdBy: req.user.email,
          updatedBy: req.user.email
        }, {
          transaction: t
        }).then((ad) => {
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
          required: true
        }, {
          model: db.AdsStats,
          attributes: ['userId', 'createdAt', 'updatedAt', 'createdBy'],
          required: false
        }],
        order: [
          ['createdAt', 'DESC']
        ],
        offset: params.offset,
        limit: 20
      }).then(ads => {
        const result = [];
        ads.forEach((ad) => {
          ad = ad.toJSON();
          ad.views = ad.AdsStats.length;
          ad.userViews = ad.duration = 0;
          _.forEach(ad.AdsStats, (stat) => {
            if (stat.userId === req.user.id) {
              ad.userViews += 1;
              const createdAt = new Date(stat.createdAt);
              const updatedAt = new Date(stat.updatedAt);
              ad.duration += (updatedAt.getTime() - createdAt.getTime()) / 1000;
            }
          });
          delete ad.AdsStats;
          result.push(ad);
        });
        return res.status(200).json(result);
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Ads not found`);
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

const viewAd = (req, res) => {
  const schema = Joi.object().keys({
    adId: Joi.number().required(),
    statType: Joi.string().required()
  }).options({
    stripUnknown: true
  });

  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      return db.AdsStats.create({
        adId: params.adId,
        userId: req.user.id,
        statType: params.statType,
        createdBy: req.user.email,
        updatedBy :req.user.email
      }).then(data => {
        return db.AdsStats.findAll({
          attributes: [
            [db.sequelize.literal('EXTRACT(EPOCH FROM ("AdsStats"."updatedAt" - "AdsStats"."createdAt"))'), 'duration'],
            'adId',
            'userId',
            'createdBy'
          ],
          where: {
            adId: params.adId,
            statType: params.statType
          },
          raw: true
        }).then(allViews => {
          const ad = {
            userViews: 0,
            viewUsers: [],
            viewers: []
          };
          _.forEach(allViews, (stat) => {
            if (stat.userId === req.user.id) {
              ad.userViews += 1;
            }
          });
          _.forEach(_.groupBy(allViews, 'createdBy'), (element, key) => {
            ad.viewUsers.push({
              user: key,
              duration: _.sumBy(element, 'duration'),
              views: element.length
            });
            ad.viewers.push(key);
          });
          return res.status(200).json({data, ad});
        }).catch(reason => {
          console.log(reason);
          return res.status(404).json(`Data not found`);
        });
        // return res.status(200).json(data);
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Data not found`);
      });
    }
  });
}

const updateView = (req, res) => {
  const schema = Joi.object().keys({
    viewId: Joi.number().required(),
    userId: Joi.number().required()
  }).options({
    stripUnknown: true
  });

  return Joi.validate(req.params, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      return db.AdsStats.update({
        updatedBy: req.user.email
      }, {
        where: {
          id: params.viewId
        },
        individualHooks: (params.userId == req.user.id) ? false : true,
        user: req.user
      }).then(data => {
        return res.status(200).json(data);
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Data not found`);
      });
    }
  });
}

const myAds = (req, res) => {
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
          required: true
        }, {
          model: db.AdsStats,
          attributes: [
            'userId',
            'createdAt',
            [db.sequelize.literal('EXTRACT(EPOCH FROM ("AdsStats"."updatedAt" - "AdsStats"."createdAt"))'), 'duration']
          ],
          required: false
        }],
        order: [
          ['createdAt', 'DESC']
        ],
        where: {
          userId: req.user.id
        },
        offset: params.offset,
        limit: 20
      }).then(ads => {
        const result = [];
        ads.forEach((ad) => {
          ad = ad.toJSON();
          ad.views = ad.AdsStats.length;
          // ad.userViews = 0;
          // _.forEach(ad.AdsStats, (stat) => {
          //   if (stat.userId === req.user.id) {
          //     ad.userViews += 1;
          //   }
          // });
          // ad.viewUsers = [];
          // ad.viewers = [];
          // _.forEach(_.groupBy(ad.AdsStats, 'createdBy'), (element, key) => {
          //   ad.viewUsers.push({
          //     user: key,
          //     duration: _.sumBy(element, function(o) {
          //       const createdAt = new Date(o.createdAt);
          //       const updatedAt = new Date(o.updatedAt);
          //       var seconds = (updatedAt.getTime() - createdAt.getTime()) / 1000;
          //       return seconds;
          //     }),
          //     views: element.length
          //   });
          //   ad.viewers.push(key);
          // });
          delete ad.AdsStats;
          result.push(ad);
        });
        return res.status(200).json(result);
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Ads not found`);
      });
    }
  });
}

const deleteAd = (req, res) => {
  const schema = Joi.object().keys({
    id: Joi.number().required()
  }).options({
    stripUnknown: true
  });

  return Joi.validate(req.params, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      return db.sequelize.transaction().then((t) => {
        return db.AdsStats.destroy({
          where: {
            adId: params.id
          },
          transaction: t
        }).then(() => {
          return db.AdsMedia.destroy({
            where: {
              adId: params.id,
            },
            transaction: t
          }).then(() => {
            return db.AdsFilters.destroy({
              where: {
                adId: params.id,
              },
              transaction: t
            }).then(() => {
              return db.Ads.destroy({
                where: {
                  id: params.id,
                  userId: req.user.id
                },
                transaction: t
              }).then(data => {
                if (data) {
                  return t.commit().then(() => {
                    return res.status(200).json('Ad deleted Successfully');
                  })
                } else {
                  return res.status(404).json('Unable to delete Ad');
                }
              }).catch(reason => {
                console.log(reason);
                return res.status(404).json(`Data not found`);
              });
            }).catch(reason => {
              console.log(reason);
              return res.status(404).json(`Data not found`);
            });
          }).catch(reason => {
            console.log(reason);
            return res.status(404).json(`Data not found`);
          });
        }).catch(reason => {
          console.log(reason);
          return res.status(404).json(`Data not found`);
        });
      }).catch((e) => {
        return res.status(404).json(e);
      })
    }
  });
}

const viewMyAd = (req, res) => {
  const schema = Joi.object().keys({
    adId: Joi.number().required(),
    statType: Joi.string().required()
  }).options({
    stripUnknown: true
  });

  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      return db.AdsStats.findAll({
        attributes: [
          [db.sequelize.literal('EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))'), 'duration'],
          'adId',
          'userId',
          ['createdBy', 'user'],
          'createdAt'
        ],
        where: {
          adId: params.adId,
          statType: params.statType
        },
        raw: true
      }).then(allViews => {
        const ad = {
          userViews: 0,
          viewUsers: [],
          viewers: []
        };
        _.forEach(allViews, (stat) => {
          if (stat.userId === req.user.id) {
            ad.userViews += 1;
          }
        });
        _.forEach(_.groupBy(allViews, 'user'), (element, key) => {
          ad.viewUsers.push({
            user: key,
            duration: _.sumBy(element, 'duration'),
            views: element.length
          });
          ad.viewers.push(key);
        });
        return res.status(200).json({allViews, ad});
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Data not found`);
      });
      // return res.status(200).json(data);
    }
  });
}

const downloadStats = (req, res) => {
  const schema = Joi.object().keys({
    adId: Joi.number().required(),
    statType: Joi.string().required()
  }).options({
    stripUnknown: true
  });

  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      return db.AdsStats.findAll({
        attributes: [
          'userId',
          ['createdBy', 'user'],
          'adId',
          [db.sequelize.literal('EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))'), 'duration'],
          [db.sequelize.fn('to_char', db.sequelize.col('createdAt'), 'DD Mon YYYY'), 'createdAt']
        ],
        where: {
          adId: params.adId,
          statType: params.statType
        },
        raw: true
      }).then(allViews => {
        return res.status(200).json({
          success: true,
          data: allViews
        });
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Data not found`);
      });
      // return res.status(200).json(data);
    }
  });
}

module.exports = {
  createAd: createAd,
  listing: listing,
  getMetaData: getMetaData,
  viewAd: viewAd,
  updateView: updateView,
  myAds: myAds,
  deleteAd: deleteAd,
  viewMyAd: viewMyAd,
  downloadStats: downloadStats
};
