var express = require('express')
  , router = express.Router()

router.use('/login', require('./login/index'))
// router.use('/signup', require('./signup/index'))
router.use('/verification', require('./verification/index'))

module.exports = router