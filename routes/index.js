var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'AgilePokerApp' });
});

/* GET admin page. */
router.get('/ScrumMaster', function(req, res, next) {
  res.render('admin', { title: 'ScrumMaster' });
});

module.exports = router;
