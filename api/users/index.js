var express = require('express')
  , router = express.Router()
const passport = require('passport');
const controller = require('./controller');
// POST /verication?token=[string]&email=[string]
router.get('/api/getuser',  passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});
router.post('/api/user/update',  passport.authenticate('jwt', { session: false }), controller.updateUser);

module.exports = router;