var express = require('express')
  , router = express.Router()
var db = require('../../storage/main/models/index');

router.get('/', (req, res) => {
  db.Users.find().then((result) => {
    res.send(result);
  });
})

module.exports = router;