var express = require('express')
  , router = express.Router()

const controller = require('./controller');
  // POST /verication?token=[string]&email=[string]
router.get('/getregion', controller.getRegionData);

module.exports = router