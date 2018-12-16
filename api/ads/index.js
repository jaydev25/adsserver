var express = require('express')
  , router = express.Router()
const AdsController = require('./controller');
const passport = require('passport');
// POST /verication?token=[string]&email=[string]
router.post('/api/ads/create',  passport.authenticate('jwt', { session: false }), AdsController.createAd);
router.post('/api/ads/view',  passport.authenticate('jwt', { session: false }), AdsController.viewAd);
router.get('/api/ads/updateview/:viewId/:userId',  passport.authenticate('jwt', { session: false }), AdsController.updateView);
router.get('/api/ads/listing/', passport.authenticate('jwt', { session: false }), AdsController.listing);
router.get('/api/ads/myads/', passport.authenticate('jwt', { session: false }), AdsController.myAds);
router.delete('/api/ads/delete/:id', passport.authenticate('jwt', { session: false }), AdsController.deleteAd);
router.get('/api/ads/getmetadata/', passport.authenticate('jwt', { session: false }), AdsController.getMetaData);
router.post('/api/ads/viewmyad',  passport.authenticate('jwt', { session: false }), AdsController.viewMyAd);

module.exports = router;