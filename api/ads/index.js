var express = require('express')
  , router = express.Router()
const AdsController = require('./controller');
const passport = require('passport');
// POST /verication?token=[string]&email=[string]
router.post('/api/ads/create',  passport.authenticate('jwt', { session: false }), AdsController.createAd);

module.exports = router;