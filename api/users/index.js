var express = require('express')
  , router = express.Router()
const passport = require('passport');
// POST /verication?token=[string]&email=[string]
router.get('/api/getuser',  passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;