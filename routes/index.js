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

/* GET spectator page. */
router.get('/spectator', function(req, res, next) {
  res.render('spectator', { title: 'Spectator' });
});

module.exports = router;
