'use strict';

var express = require('express')
  , router = express.Router()
const AuthController = require('../../middlewares/auth');
  // POST /verication?token=[string]&email=[string]
router.post('/', AuthController.signUp);
router.post('/verifypayment', AuthController.verifypayment);

module.exports = router;