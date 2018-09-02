var express = require('express')
  , router = express.Router()
const SignUpController = require('./controller');
  // POST /verication?token=[string]&email=[string]
router.post('/', SignUpController);

module.exports = router;