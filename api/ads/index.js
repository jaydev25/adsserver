var express = require('express')
  , router = express.Router()
const AdsController = require('./controller');
const passport = require('passport');
// POST /verication?token=[string]&email=[string]
router.post('/api/ads/create',  passport.authenticate('jwt', { session: false }), AdsController.createAd);
router.get('/api/ads/listing/', passport.authenticate('jwt', { session: false }), AdsController.listing);
router.get('/api/ads/getmetadata/', passport.authenticate('jwt', { session: false }), AdsController.getMetaData);

module.exports = router;